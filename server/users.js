let users = [];
let userPubKeys = [];

/**
 * @param {id, name, room, key}
 * if user isn't exist already then add the user and then store user key and array
 * @return user:{id, name, room}
 * */
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
        _id:id,
        name,
        room,
    };

    users.push(user);
    if (!userPubKeys.map(u=>u.name).includes(name)) {
        userPubKeys.push({name, key})
        console.log(`User ${name} key updated ${key}`)
    }
    return user;
};


const removeUser = (id) => {
    const index = users.findIndex((user) => user._id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUserById = (id) => {
    return users.find((user) => user._id === id)
}
const getKeyByUserName = (name) => {
    return userPubKeys.find((user) => user.name === name.toLowerCase())
}

const getRoomUsers = (room) => {return users.filter((user) => user.room === room);};

module.exports = {
    addUser,
    removeUser,
    getUserById,
    getRoomUsers,
    getKeyByUserName,
};
