import React, {useState, useEffect} from "react";
import {useLocation, Link} from "react-router-dom";
import queryString from "query-string";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import * as CryptoJS from 'crypto-js';
import {defaultKey} from "../crypto";

let socket;
const Chat = () => {
    const {search} = useLocation();
    const {name, room} = queryString.parse(search);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    /*
  * Encrypt a derived hd private key with a given pin and return it in Base64 form
  */
    const encryptAES = (text, key) => {
        return CryptoJS.AES.encrypt(text, key).toString();
    };


    /**
     * Decrypt an encrypted message
     * @param encryptedBase64 encrypted data in base64 format
     * @param key The secret key
     * @return The decrypted content
     */
    const decryptAES = (encryptedBase64, key) => {
        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
        if (decrypted) {
            try {
                console.log(decrypted);
                const str = decrypted.toString(CryptoJS.enc.Utf8);
                if (str.length > 0) {
                    return str;
                } else {
                    return 'error 1';
                }
            } catch (e) {
                return 'error 2';
            }
        }
        return 'error 3';
    };


    useEffect(() => {
        socket = io("http://localhost:4000");

        socket.emit("join", {name, room}, (error) => {
            if (error) {
                alert(error);
            }
        });

        socket.on("message", (message) => {
            setMessages((exitstingMsgs) => [...exitstingMsgs, message]);
        });

        socket.on("userList", ({roomUsers}) => {
            setUsers(roomUsers);
        });

        return () => {
            socket.disconnect()
            socket.close();
        };
    }, [name, room]);

    const sendMessage = (e) => {
        if (e.key === "Enter" && e.target.value) {
            socket.emit("message", encryptAES(e.target.value, defaultKey));
            e.target.value = "";
        }
    };

    return (
        <div className="chat">
            <div className="user-list">
                <div>User Name</div>
                {users.map((user) => (
                    <div key={user.id}>{user.name}</div>
                ))}
            </div>
            <div className="chat-section">
                <div className="chat-head">
                    <div className="room">{room}</div>
                    <Link to="/">X</Link>
                </div>
                <div className="chat-box">
                    <ScrollToBottom className="messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${name === message.user ? "self" : ""}`}
                            >
                                <span className="user">{message.user}</span>
                                {/*<span className="message-text">{message.text}</span>*/}
                                <span className="message-text">{decryptAES(message.text, defaultKey)}</span>
                            </div>
                        ))}
                    </ScrollToBottom>
                    <input placeholder="message" onKeyDown={sendMessage}/>
                </div>
            </div>
        </div>
    );
};

export default Chat;