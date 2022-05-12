import * as openpgp from "openpgp";

var publicKey, privateKey, passPhrase = 'super long and hard to guess secret';

const generateKey = async () => {
    const key = await openpgp.generateKey({
        type: 'rsa', // Type of the key
        rsaBits: 4096, // RSA key size (defaults to 4096 bits)
        userIDs: [{name: 'Jon Smith', email: 'jon@example.com'}], // you can pass multiple user IDs
        passphrase: passPhrase // protects the private key
    });
    privateKey = key.privateKey
    publicKey = key.publicKey

};
export const encryptedText = async (plainText) => {
    if (!publicKey && !privateKey) {
        console.log(await generateKey())
    }
    let message = await openpgp.createMessage({text: plainText})
    const pubKey = await openpgp.readKey({armoredKey: publicKey});
    return await openpgp.encrypt({
        message: message,
        encryptionKeys: pubKey
    }).then(async (encryptedMessage) => {
        return encryptedMessage;
    })
}

export const decryptedText = async (encryptedMsg) => {
    const decryptionKeys = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({armoredKey: privateKey}),
        passphrase: passPhrase
    });
    const message = await openpgp.readMessage({
        armoredMessage: encryptedMsg // parse armored message
    });
    console.log(`decryption key ${decryptionKeys}`)
    // console.log(`message readMessage ${JSON.stringify(message)}`)
    const { data: decrypted, signatures } = await openpgp.decrypt({
        message,
        verificationKeys: publicKey, // optional
        decryptionKeys: decryptionKeys
    });
    try {
        await signatures[0].verified; // throws on invalid signature
        console.log('Signature is valid');
    } catch (e) {
        throw new Error('Signature could not be verified: ' + e.message);
    }
    return {decrypted, signatures}
}
