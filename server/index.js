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

const getUserKey = async (name) => {
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
}
io.on("connection", (socket) => {
    console.log("a user connected ", socket.id);

    socket.on("join", async ({name, room}, callback) => {
        console.log(`\nJoining New User ${name} to the room ${room}\n`)

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
        const userData = {
            id: socket.id,
            name: "System",
            room: room,
            serverPubKey: serverPublicKey,
            priKey: key.privateKey
        }

        socket.join(room);
        socket.emit("message", {
            user: userData,
            text: `welcome ${name} to ${room}.`,
        });
        socket.broadcast.to(room).emit("message", {
            user: {name: "System"},
            text: `${name} just joined ${room}.`,
        });

        const roomUsers = getRoomUsers(room);
        io.to(room).emit("userList", {roomUsers});

        callback();
    });

    socket.on("message", async (message) => {
        // await sendMessage(message, socket)
        const user = getUserById(socket.id);
        console.log(`\n message sent by ${JSON.stringify(user)}`)
        // Todo Save decrypted msg to DB
        console.log(`\n received encrypted message ${message}`)
        const decryptedMessage = await decryptedText(message, serverPrivateKey)
        console.log(`\n decrypted message ${decryptedMessage}`)
        const users = getRoomUsers(user.room)
        // console.log(`all users ${JSON.stringify(users)}`)


        const recipient = users.filter((usr)=> usr.id !== user.id)
        console.log(`\n recipient ${JSON.stringify(recipient)}`)
        const userKeyChain = getKeyByUserName(recipient[0].name)
        // console.log(`\n\n\nUser Key Chain ${JSON.stringify(userKeyChain)}\n\n\n`)
        const encryptedMessage =  await encryptedText(decryptedMessage, userKeyChain.key.publicKey)
        console.log(`\n sending encrypted message ${JSON.stringify(encryptedMessage)}`)
        // broadcast msg as encrypted
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
    console.log(`Example app listening at http://localhost:${port}`)
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