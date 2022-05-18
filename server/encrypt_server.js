const openpgp = require('openpgp')

let passPhrase = 'super long and hard to guess secret'; // passphrase is same for both client and server

/**
 * @param plainText
 * @param userPubKey
 * encrypt plain message using receiver public key as though the receiver can easily decrypt the message
 * @return encrypted message
 * */
const encryptedText = async (plainText, userPubKey) => {
    return await openpgp.encrypt({
        message: await openpgp.createMessage({text: plainText}),
        encryptionKeys: await openpgp.readKey({armoredKey: userPubKey}),
    }).then(async (encryptedMessage) => {
        return encryptedMessage;
    })
}

/**
 * @param encryptedMsg
 * @param serverPriKey
 * receive the message was encrypted using server public key and decrypted this
 * encrypted message using server private key
 * @return decrypted plain message
 * */
const decryptedText = async (encryptedMsg, serverPriKey) => {
    const {data: decrypted} = await openpgp.decrypt({
        message: await openpgp.readMessage({armoredMessage: encryptedMsg}),
        decryptionKeys: await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({armoredKey: serverPriKey}),
            passphrase: passPhrase
        }),
    });
    return decrypted
}
module.exports = {
    encryptedText,
    decryptedText
};