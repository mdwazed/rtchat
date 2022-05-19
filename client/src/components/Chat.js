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
        socket = io("http://localhost:4000");

        // alerting if any error raised during joining the user
        socket.emit("join", {name, room}, (error) => {
            if (error) alert(error)
        });

        /**
         * receiving message and decrypting them if encrypted then store them to react state
         * */
        socket.on("message", async (message) => {
            if (message.user.name === 'System') {
                if (message.user.id !== undefined) {
                    setUserKey({
                        name: name?.toLowerCase(),
                        serverPubKey: message.user.serverPubKey,
                        priKey: message.user.priKey,
                        room: message.user.room
                    })
                }
                if (!messages.map(m=>m.user.name).includes('System'))setMessages((exitstingMsgs) => [...exitstingMsgs, message]);
            } else if (userKey.name !== message.user.name) {
                message.text = await decryptedText(message.text, userKey.priKey)
                setMessages((exitstingMsgs) => [...exitstingMsgs, message]);
            }
        });

        socket.on("userList", ({roomUsers}) => {
            setUsers(roomUsers);
        });

        return () => {
            socket.disconnect()
            socket.close();
        };
    }, [name, room, userKey.name, userKey.priKey]);

    const sendMessage = async (e) => {
        if (e.key === "Enter" && e.target.value) {
            const value = e.target.value
            socket.emit("message", await encryptedText(value, userKey.serverPubKey));
            setMessages((exitstingMsgs) => [...exitstingMsgs, {text: value, user: {name: name}}]);
            e.target.value = ""
        }
    };

    const openCallWindow = () => {
        window.open('http://localhost:3000/call','Data','height=250,width=250');
    }

    return (
        <div className="chat">
            <div className="user-list">
                <div>User Name</div>
                {users?.map((user) => (
                    <div key={user.id}>{user.name}</div>
                ))}
            </div>
            <div className="chat-section">
                <div className="chat-head">
                    <div className="room">{room}</div>
                    <i className='bx bxs-phone-call call' onClick={openCallWindow} />
                    <Link to="/">X</Link>
                </div>
                <div className="chat-box">
                    <ScrollToBottom className="messages">
                        {messages.map((message, index) => {
                            return <div
                                key={index}
                                className={`message ${name.toLowerCase() === message.user?.name?.toLowerCase() ? "self" : ""}`}
                            >
                                <span className="user">{message.user.name.toUpperCase()}</span>
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