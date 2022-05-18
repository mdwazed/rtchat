const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const {addUser, removeUser, getUserById, getRoomUsers, getKeyByUserName} = require("./users");
const {decryptedText, encryptedText} = require("./encrypt_server.js");
const openpgp = require("openpgp");

const port = 4000;
const app = express();

app.use(cors());

const httpServer = http.createServer(app);
let serverPublicKey, serverPrivateKey, passPhrase = 'super long and hard to guess secret';
const io = socketIO(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});


app.get("/", (req, res) => res.send("Hello World!"));

/**
 * @param name
 * @return user key from userPubKeys array if exists else generate new keychain against provided username
 * */
let getUserKey = async (name) => {
    let key;
    if (getKeyByUserName(name)) {
        key = await getKeyByUserName(name).key
        console.log(`Key already exist for ${name}`)
    } else {
        key = await openpgp.generateKey({
            type: 'rsa', // Type of the key
            rsaBits: 4096, // RSA key size (defaults to 4096 bits)
            userIDs: [{name: 'Jon Smith', email: 'jon@example.com'}], // you can pass multiple user IDs
            passphrase: passPhrase // protects the private key
        })
        console.log(`new key generated for ${name}`)
    }
    return key
};

/**
 * Socketio On Connection event
 * */
io.on("connection", (socket) => {

    // Joining new user
    socket.on("join", async ({name, room}, callback) => {

        // add new user and set keychain to the user
        let key = await getUserKey(name)
        const {error, user} = addUser({
            id: socket.id,
            name: name,
            room: room,
            key: key
        });
        if (error) {
            callback(error);
        }
        // setup userData with keychain for sending initially to the user
        const userData = {
            id: socket.id,
            name: "System",
            room: room,
            serverPubKey: serverPublicKey,
            priKey: key.privateKey
        }

        // Joining room to the socket
        socket.join(room);

        // sending user Keychain and welcome msg to the new joined user
        socket.emit("message", {
            user: userData,
            text: `welcome ${name} to ${room}.`,
        });

        // Informing other user about joining a new user
        socket.broadcast.to(room).emit("message", {
            user: {name: "System"},
            text: `${name} just joined ${room}.`,
        });

        // sending all user list related to the room
        const roomUsers = getRoomUsers(room);
        io.to(room).emit("userList", {roomUsers});

        callback();
    });

    /**
     * socket on message event is a builtin event of socketio which is used to receive all message
     * */
    socket.on("message", async (message) => {
        const user = getUserById(socket.id);
        // Todo Save decrypted msg to DB
        const decryptedMessage = await decryptedText(message, serverPrivateKey)

        /**
         * Normally io.to(user.room).emit("message") event sent message to all user of the room but here
         * we supposed only two user will join the room if one is sender other one will be receiver
         */
        const users = getRoomUsers(user.room)
        const recipient = users.filter((usr) => usr.id !== user.id)
        const userKeyChain = getKeyByUserName(recipient[0].name)
        const encryptedMessage = await encryptedText(decryptedMessage, userKeyChain.key.publicKey)
        // broadcast encrypted msg to all users except sender
        io.to(user.room).emit("message", {
            user: user,
            text: encryptedMessage
        });
    });


    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("message", {
                user: "System",
                text: `${user.name} just left ${user.room}.`,
            });
            const roomUsers = getRoomUsers(user.room);
            io.to(user.room).emit("userList", {roomUsers});
        }
    });
});

httpServer.listen(port, async () => {
    console.log(`httpServer starting at http://localhost:${port}`)
    /**
     * generating keychain for server, on starting and then
     * updating two global variable serverPrivateKey and serverPublicKey
     * */
    const key = await openpgp.generateKey({
        type: 'rsa', // Type of the key
        rsaBits: 4096, // RSA key size (defaults to 4096 bits)
        userIDs: [{name: 'Jon Smith', email: 'jon@example.com'}], // you can pass multiple user IDs
        passphrase: passPhrase // protects the private key
    })
    serverPrivateKey = key.privateKey
    serverPublicKey = key.publicKey
    console.log(`Key generated for server`)
});