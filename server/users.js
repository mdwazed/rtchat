let users = [];
let userPubKeys = [];

const addUser = ({id, name, room, key}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find(
        (user) => user.name === name && user.room === room
    );

    if (existingUser) {
        return {error: "User already exists!"};
    }

    const user = {
        id,
        name,
        room,
    };

    users.push(user);
    userPubKeys.push({name, key})
    return user;
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUserById = (id) => {return users.find((user) => user.id === id)}
const getUserExceptId = (id) => {return users.filter((user) => user.id !== id)}
const getKeyByUserName = (name) => {return userPubKeys.find((user) => user.name === name)}

const getRoomUsers = (room) => {
    const roomUsers = users.filter((user) => user.room === room);
    return roomUsers;
};

module.exports = {
    addUser,
    removeUser,
    getUserById,
    getRoomUsers,
    getKeyByUserName,
    getUserExceptId,
};