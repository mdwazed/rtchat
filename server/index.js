const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const {addUser, removeUser, getUserById, getRoomUsers, getKeyByUserName, getUserExceptId} = require("./users");
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
    if (getKeyByUserName(name) !== undefined) {
        key = await getKeyByUserName(name)
    } else {
        key = await openpgp.generateKey({
            type: 'rsa', // Type of the key
            rsaBits: 4096, // RSA key size (defaults to 4096 bits)
            userIDs: [{name: 'Jon Smith', email: 'jon@example.com'}], // you can pass multiple user IDs
            passphrase: passPhrase // protects the private key
        })
    }
    return key
}
// const sendMessage = async (message, socket) => {
//     const users = getUserExceptId(socket.id);
//     console.log(users)
//     for (const user in users) {
//         const userKeyChain = getKeyByUserName(users[user].name)
//         // console.log(`\n message received by ${JSON.stringify(user)}`)
//         // Todo Save decrypted msg to DB
//         // console.log(`\n received encrypted message ${message}`)
//         const decryptedMessage = await decryptedText(message, serverPrivateKey)
//         // console.log(`\n decrypted message ${decryptedMessage}`)
//         // console.log(`\n\n\nUser Key Chain ${JSON.stringify(userKeyChain)}\n\n\n`)
//         const encryptedMessage = userKeyChain === undefined ? 'Message Can\'t Encrypt ' : await encryptedText(decryptedMessage, userKeyChain.key.publicKey)
//         // console.log(`\n sending encrypted message ${JSON.stringify(encryptedMessage)}`)
//         // broadcast msg as encrypted
//         io.to(users[user].room).emit("message", {
//             user: users[user],
//             text: encryptedMessage
//         });
//         console.log(`\nMessage ${decryptedMessage} sent to user ${JSON.stringify(users[user])}`)
//     }
// }
io.on("connection", (socket) => {
    console.log("a user connected ", socket.id);

    socket.on("join", async ({name, room}, callback) => {
        console.log(`\nJoining New User ${name} to the room ${room}\n`)

        const key = await getUserKey(name)
        const {error, user} = addUser({
            id: socket.id,
            name: name,
            room: room,
            key: key
        });
        if (error) {
            callback(error);
        }

        socket.join(room);
        socket.emit("message", {
            user: {
                id: socket.id,
                name: "System",
                room: room,
                serverPubKey: serverPublicKey,
                priKey: key.privateKey
            },
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
        const userKeyChain = getKeyByUserName(user.name)
        // console.log(`\n message received by ${JSON.stringify(user)}`)
        // Todo Save decrypted msg to DB
        // console.log(`\n received encrypted message ${message}`)
        const decryptedMessage = await decryptedText(message, serverPrivateKey)
        // console.log(`\n decrypted message ${decryptedMessage}`)
        // console.log(`\n\n\nUser Key Chain ${JSON.stringify(userKeyChain)}\n\n\n`)
        const encryptedMessage = userKeyChain === undefined ? 'Message Can\'t Encrypt ' : await encryptedText(decryptedMessage, userKeyChain.key.publicKey)
        // console.log(`\n sending encrypted message ${JSON.stringify(encryptedMessage)}`)
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