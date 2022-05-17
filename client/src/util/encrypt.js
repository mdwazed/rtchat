import * as openpgp from 'openpgp'

let passPhrase = 'super long and hard to guess secret';

export const encryptedText = async (plainText, serverPubKey) => {
    return await openpgp.encrypt({
        message: await openpgp.createMessage({text: plainText}),
        encryptionKeys: await openpgp.readKey({armoredKey: serverPubKey}),
    }).then(async (encryptedMessage) => {
        return encryptedMessage;
    })
}

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

// const encMsg = await encryptedText('Hello World')
// const decMsg = await decryptedText(encMsg)
// console.log(decMsg)