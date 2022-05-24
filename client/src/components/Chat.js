import React, {useState, useEffect} from "react";
import {useLocation, Link} from "react-router-dom";
import queryString from "query-string";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import {decryptedText, encryptedText} from "../util/encrypt";

let socket;
const Chat = () => {
    const {search} = useLocation();
    const {name, room} = queryString.parse(search);
    const [userKey, setUserKey] = useState({})
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket = io("http://192.168.0.101:4000");

        // alerting if any error raised during joining the user
        socket.emit("join", {name, room}, (error) => {
            if (error) alert(error)
        });

        /**
         * receiving message and decrypting them if encrypted then store them to react state
         * */
        socket.on("message", async (message) => {
            if (message.user.name === 'System') {
                if (message.user._id !== undefined) {
                    setUserKey({
                        name: name?.toLowerCase(),
                        serverPubKey: message.user.serverPubKey,
                        priKey: message.user.priKey,
                        room: message.user.room,
                        _id: message.user._id
                    })
                }
                if (!messages.map(m => m.user.name).includes('System')) setMessages((exitstingMsgs) => [...exitstingMsgs, message]);
            } else if (userKey.name !== message.user.name) {
                console.log(message)
                message.text = await decryptedText(message.text, userKey.priKey)
                setMessages((exitstingMsgs) => {
                    const msgs = [...exitstingMsgs, message]
                    console.log(msgs)
                    return msgs
                });
            }
        });

        socket.on("userList", ({roomUsers}) => {
            setUsers(roomUsers);
        });

        return () => {
            socket.disconnect()
            socket.close();
        };
    }, [name, room, userKey.name, userKey.priKey, messages]);

    const sendMessage = async (e) => {
        if (e.key === "Enter" && e.target.value) {
            const msg = {
                _id: Math.round(Math.random() * 1000000),
                text: await encryptedText(e.target.value, userKey.serverPubKey),
                // text: e.target.value,
                createdAt: new Date(),
                user: {
                    _id: userKey._id,
                    name: userKey.name,
                },
            }
            socket.emit("message", msg)
            msg.text = e.target.value
            setMessages((exitstingMsgs) => [...exitstingMsgs, msg]);
            e.target.value = ""
        }
    };

    const openCallWindow = () => {
        window.open('http://localhost:3000/call', 'Data', 'height=250,width=250');
    }

    return (
        <div className="chat">
            <div className="user-list">
                <div>User Name</div>
                {users?.map((user) => (
                    <div key={user._id}>{user.name}</div>
                ))}
            </div>
            <div className="chat-section">
                <div className="chat-head">
                    <div className="room">{room}</div>
                    <i className='bx bxs-phone-call call' onClick={openCallWindow}/>
                    <Link to="/">X</Link>
                </div>
                <div className="chat-box">
                    <ScrollToBottom className="messages">
                        {messages.map((message, index) => {
                            return <div
                                key={index}
                                className={`message ${userKey?.name?.toLowerCase() === message.user?.name?.toLowerCase() ? "self" : ""}`}
                            >
                                <span className="user">{message?.user?.name?.toUpperCase()}</span>
                                <span className="message-text">{message.text}</span>
                            </div>
                        })}
                    </ScrollToBottom>
                    <input placeholder="message" onKeyDown={sendMessage}/>
                </div>
            </div>
        </div>
    );
};

export default Chat;
