const openpgp = require('openpgp')

let passPhrase = 'super long and hard to guess secret';

const encryptedText = async (plainText, userPubKey) => {

    return await openpgp.encrypt({
        message: await openpgp.createMessage({text: plainText}),
        encryptionKeys: await openpgp.readKey({armoredKey: userPubKey}),
    }).then(async (encryptedMessage) => {
        return encryptedMessage;
    })
}

const decryptedText = async (encryptedMsg, serverPriKey) => {
    const message = await openpgp.readMessage({armoredMessage: encryptedMsg})
    const {data: decrypted} = await openpgp.decrypt({
        message: message,
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