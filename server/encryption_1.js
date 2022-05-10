import { pki, util, random, cipher } from "node-forge";

// generate public/private key pair
let keypair;
await pki.rsa.generateKeyPair({bits: 2048, workers: 2}, (err, k) => {
    keypair = k;
});
// convert public key to PEM format
const publicKey = pki.publicKeyToPem(keypair.publicKey);

// send the PEM formated public key to server and
// save the encrypted shared key and handshake id
const {
    encryptedKey,
    handshakeId
} = await axios.post("http://127.0.0.1/api/handshake",
    {
        "publicKey": publicKey,
    })
    .then((result) => result.data)
    .catch((error) => error);