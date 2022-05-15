import * as openpgp from 'openpgp'

let publicKey, privateKey, passPhrase = 'super long and hard to guess secret';

const generateKey = async () => {
    const key = await openpgp.generateKey({
        type: 'rsa', // Type of the key
        rsaBits: 4096, // RSA key size (defaults to 4096 bits)
        userIDs: [{name: 'Jon Smith', email: 'jon@example.com'}], // you can pass multiple user IDs
        passphrase: passPhrase // protects the private key
    });
    privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: key.privateKey }),
        passphrase: passPhrase
    });
    publicKey = await openpgp.readKey({armoredKey: key.publicKey})
};

export const encryptedText = async (plainText) => {
    if (!publicKey && !privateKey) await generateKey()
    return await openpgp.encrypt({
        message: await openpgp.createMessage({text: plainText}),
        encryptionKeys: publicKey,
        signingKeys: privateKey
    }).then(async (encryptedMessage) => {
        return encryptedMessage;
    })
}

export const decryptedText = async (encryptedMsg) => {
    const message = await openpgp.readMessage({armoredMessage: encryptedMsg})
    const {data: decrypted, signatures} = await openpgp.decrypt({
        message: message,
        decryptionKeys: privateKey,
        verificationKeys: publicKey, // optional
    });
    try {
        await signatures[0].verified; // throws on invalid signature
        console.log('Signature is valid');
    } catch (e) {
        throw new Error('Signature could not be verified: ' + e.message);
    }
    console.log(`decrypted message is ${decrypted}`)
    return decrypted
}

// const encMsg = await encryptedText('Hello World')
// const decMsg = await decryptedText(encMsg)
// console.log(decMsg)