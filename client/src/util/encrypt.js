import * as openpgp from 'openpgp'

let passPhrase = 'super long and hard to guess secret'; // passphrase is same for both client and server

/**
 * @param plainText
 * @param serverPubKey
 * encrypt plain message using server public key as though the server can easily decrypt the message
 * @return encrypted message
 * */
export const encryptedText = async (plainText, serverPubKey) => {
    return await openpgp.encrypt({
        message: await openpgp.createMessage({text: plainText}),
        encryptionKeys: await openpgp.readKey({armoredKey: serverPubKey}),
    }).then(async (encryptedMessage) => {
        return encryptedMessage;
    })
}

/**
 * @param encryptedMsg
 * @param priKey
 * receive the message was encrypted using sender public key and decrypted this
 * encrypted message using sender private key which was stored to the server
 * @return decrypted plain message
 * */
export const decryptedText = async (encryptedMsg, priKey) => {
    const message = await openpgp.readMessage({armoredMessage: encryptedMsg})
    const {data: decrypted} = await openpgp.decrypt({
        message: message,
        decryptionKeys: await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({armoredKey: priKey}),
            passphrase: passPhrase
        }),
    });
    return decrypted
}