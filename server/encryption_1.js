import * as openpgp from 'openpgp'; // use as CommonJS, AMD, ES6 module or via window.openpgp

(async () => {
    // put keys in backtick (``) to avoid errors caused by spaces or tabs
    const publicKeyArmored = `lQPGBGEcehABCAC2/ws+pKo/9DB2JgQI3IXUXtj666KfHiFF2GjfEY5FvWIqm7CqMneNHyp+HfgjI6L0C1UAhUtUZaHFpKYfCbKoXH4Odwvor8f1RaxA7/IdvY+JJdx22tv/ZJdAP35XXRp0XrHPQIyEnTlvWPTPNFKb3kRaEFJnJfbCGSfocSWq9mrPc1J3`;
    const privateKeyArmored = `lQPGBGEcehABCAC2/ws+pKo/9DB2JgQI3IXUXtj666KfHiFF2GjfEY5FvWIqm7CqMneNHyp+HfgjI6L0C1UAhUtUZaHFpKYfCbKoXH4Odwvor8f1RaxA7/IdvY+JJdx22tv/ZJdAP35XXRp0XrHPQIyEnTlvWPTPNFKb3kRaEFJnJfbCGSfocSWq9mrPc1J3`; // encrypted private key
    const passphrase = `yourPassphrase`; // what the private key is encrypted with

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase
    });

    const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: 'Hello, World!' }), // input as Message object
        encryptionKeys: publicKey,
        signingKeys: privateKey // optional
    });
    console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'

    const message = await openpgp.readMessage({
        armoredMessage: encrypted // parse armored message
    });
    const { data: decrypted, signatures } = await openpgp.decrypt({
        message,
        verificationKeys: publicKey, // optional
        decryptionKeys: privateKey
    });
    console.log(decrypted); // 'Hello, World!'
    // check signature validity (signed messages only)
    try {
        await signatures[0].verified; // throws on invalid signature
        console.log('Signature is valid');
    } catch (e) {
        throw new Error('Signature could not be verified: ' + e.message);
    }
})();