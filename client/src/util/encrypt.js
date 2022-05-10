const openpgp = require('openpgp') // use as CommonJS, AMD, ES6 module or via window.openpgp
let publicKey, privateKey;

let options = {
    userIDs: { name: 'Alice', email: 'alice@example.com' },
    passphrase: 'secret',
}

const generateKey = () => {
    openpgp.generateKey(options).then((key) => {
        publicKey = key.privateKey
        privateKey = key.publicKey
    })
}
export const encryptedText = (plainText) => {
    if(!publicKey && !privateKey) {
        generateKey()
    }
    let message = openpgp.createMessage({text: 'hello world!'})
    console.log(`type message ${typeof message}`)
    openpgp.encrypt({message: message, encryptionKeys: publicKey}).then((encryptedData) => {
        console.log(encryptedData.data)
    })
}































// // put keys in backtick (``) to avoid errors caused by spaces or tabs
// const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----
// MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAz7vmktQHyj0OieHH2k4A
// sP+yKoQ7HN6m953qB3tnj/YYwCPb0k+ekb2gKNL9lKtdXkoPcN6tj5jwCoIzSowM
// CWcrUUCRiR0hGKkXo6/hZmHoPdet1bQnCmEE9dGPcd8os6E2zsqudfvYaGsqvhHG
// vsKzxzFeRgar6+jTjxJriyFocROWtYejOl8V1/vmR7RLeisarKNclW+o9Pugf9aX
// 71VRR3a/J3H0wNfTeWOgvIs3U/IkJXiOWocUSyttLkHPCGNu0Y3MMKycxReu7asB
// RX/qfTkYFpdah0OHz65IGSxYB8SWlByd5lUbZfvha7lU26snxB6Z2fKkaV9g6NXj
// MkjM2rwIvUHBSHNd3IKJHkcPqsftcXqFKRH7K8o47hOvLNFOcVxhyqIK9C8W7iX9
// UtN6StxEaKXwibunAQkJ+7iYdG/c0+lLo9l4+dLddEn45k8/RCS76BJtucy/VHQo
// nRdoFNV2PQMJNahkMhMG0uoethYgh8IspdVqKjRa5NuegYXUTAgvkxeAyV++Phfp
// nHcOyKuFJWYdl3Jun7IMgANcfdUdaRNESF9NCZfiTBb7Xi9+bzvlqRDiyMuV5D+q
// 0OHQXMnmL6tyqrSgNn3GZ4SZKUDYio57INzxyN6YcqRNSe+G+qZK+pJuix031gpg
// X1QNzFugitEflCxIgbu6/YUCAwEAAQ==
// -----END PGP PUBLIC KEY BLOCK-----`;
// const privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----
// MIIJKQIBAAKCAgEAz7vmktQHyj0OieHH2k4AsP+yKoQ7HN6m953qB3tnj/YYwCPb
// 0k+ekb2gKNL9lKtdXkoPcN6tj5jwCoIzSowMCWcrUUCRiR0hGKkXo6/hZmHoPdet
// 1bQnCmEE9dGPcd8os6E2zsqudfvYaGsqvhHGvsKzxzFeRgar6+jTjxJriyFocROW
// tYejOl8V1/vmR7RLeisarKNclW+o9Pugf9aX71VRR3a/J3H0wNfTeWOgvIs3U/Ik
// JXiOWocUSyttLkHPCGNu0Y3MMKycxReu7asBRX/qfTkYFpdah0OHz65IGSxYB8SW
// lByd5lUbZfvha7lU26snxB6Z2fKkaV9g6NXjMkjM2rwIvUHBSHNd3IKJHkcPqsft
// cXqFKRH7K8o47hOvLNFOcVxhyqIK9C8W7iX9UtN6StxEaKXwibunAQkJ+7iYdG/c
// 0+lLo9l4+dLddEn45k8/RCS76BJtucy/VHQonRdoFNV2PQMJNahkMhMG0uoethYg
// h8IspdVqKjRa5NuegYXUTAgvkxeAyV++PhfpnHcOyKuFJWYdl3Jun7IMgANcfdUd
// aRNESF9NCZfiTBb7Xi9+bzvlqRDiyMuV5D+q0OHQXMnmL6tyqrSgNn3GZ4SZKUDY
// io57INzxyN6YcqRNSe+G+qZK+pJuix031gpgX1QNzFugitEflCxIgbu6/YUCAwEA
// AQKCAgBKj7QD8YzWPzIPtXWJWsQOw8hMUGfzRcuCRzDv/JBAcOGTXYuSIjfVMc3h
// uVGBYjzCEi0WoyaCyy8lZnRIhpnvahN3N4jFQSpW8qJkg0WQ/QVh5R8k/GOi6w3f
// uZcWFTZDu1KzyLXz7TBQ0l5mGHVQlQv4LDUdR1m/9DKzQLZPGu+k3pYSlBu3YNez
// TVvrUsBgmkYZvw0FKi3nuMVz/S9NnT7uOqYD33gtG4pxIJxZ8FIslFX7CRl3TtKu
// 5Ghs2PwZk678Ejw/IEWozIZiEiYDrxUYWzzVJwA8WrXNik2gk3UJXLt7cAYQ3W1X
// HqBbjQrzSaydTSqFuvzeQXjEObkw9rSKiJ0VIIP9bdoWroI0rv7uKKGNmQu0uVZx
// 2JD3ZpBuMRgi+JNMkjrfmBd8EjxKpAcGpfWBdqpVs4VN5H8Ut85RoMc3hpkMwMS3
// ayCaAtbJtNnl/K7C3fO5FF23kwe954HiG6T85XNkJcn8i7QiHwuPQggH1KS0KXN5
// mo4L2OVoWp2Pag/AYXApRc/IIu2zrU8/qYatCoqrRdhSc1Y301hmMx4K2Z7/AqaK
// JHgzFUX9MWMA/lcFCu0W41JReWJjRLBwWQI+2fFWdB8N1+Q/cRLElWWCKFOlkNJB
// l3gpyvm048P8Y4yiNr6XAGKxYOR+avpiT9vUrK/ryfVoqUvmpQKCAQEA6p6BfSXV
// QKp29GWmVgbA0t2vY1pgEEBtGyci0oFhkDPlRp+LuB6S6SBz+a0xDrlhD9H2cTl4
// E7xXYo6wWupujFq3oYNRZ19sx51bGVer/7dareT3ALUD5LfCLP09yODcGcKLExQi
// 1lNm7ZWym/7Z0+Atwwl9kZ1TqucogZtfeMoJmZ9C1F8lAy2SL/0LpiqTZ5u55hQK
// gGSAZh0QXp9PnShpoi/G4IsekAtg9r7HIkRq6LGmBuWBdI3saI4ucRCLOrTnHzoQ
// hH9pI9yG6N//Gz7vmAyqTcs5mcSJMmLcJ+3Nlibxp53SsFWSb4TCgU3wGY1Lr0rP
// YSt14lM7/dt3PwKCAQEA4qou64x8yiaRDHxsRwhBjwPbumwl5rY+/p5efysdjlVu
// YJheW8/NXkRXc8sYiyHkl6lNR3FgYX5yeNctFYtbFGr+u+ea+XR3TZFPIN30ZNhm
// L5jvPz96DQ40vef70tNW6W2rTkWVPs4wk5U9LiEw09cCrOHYah/6vdPYPqQ+c5ZC
// OdNOfMslnlkKheznUoZW5SuApGW/emMxW4d7U6MMDgyJAAw52FTADYMOhAMgKeNW
// OzUbHo9OGrP64ycs0MUUHNelwO60h5mLI+WFed2h73YAlllIgJ2klpi8OzFA6VxG
// 1+QWXToznGTv8JQje8ZAFtn9dyuIekZo/aqWNqr+OwKCAQEAmnT5WHN0vhq7L1BQ
// Pig5/1hUY7sWrPxNF+ge46irmyyfD2xvpinym6ly0Hd1aXUfcjPO42FrLMr8WHUJ
// owDdAGekpp72E3DeA1gTpk5yfGmwN/UZq4x/4K4dFlMtvrZSEF9kAY5rFOBZTaYU
// rOANdZALcHAqC5gggc2mfBTWuIWB5nHTpE5y5nG04QTdC2rSGg6KRu8Art/7K76M
// jU6iMhtt14lOi3rrBveGwUp9fJDANSrm23lyTVI1xet8pZC3qFF6KrOmNiRPCn3f
// DyaQIta/E0GbSJW2+QVLMTGmMF88zlIbGzcqgk4Dlok3J7swixHbNq6wcg8Tj4ku
// YISALwKCAQAAs7w/eIjua14ppr0DH1Bsq/tjQXCAnXHmggES7cRCq5sS64XnTOZ6
// 80U+E5P44lr96UVXAk/lHWonW6tFFNBsaMRvOpFtUmIIOHoBRQ67vTvby+J51K2B
// Gtko+W37QjJTuMY+ENMchbD61AyDdxDapyDX/j8YXQ7+xYg28XVMEFwWJ8RneI2e
// RvJUZd51j/r27MKSP8pvC52chffo02l3JazK9j67n8+UeyJxYD0aRB0BQ/HYj2MT
// jBkr2PQ3lVSxni1iQpsGjIA01UIrlXcp8bigvpgN5e8blE+I82cbEfEaPBehpEuC
// oYFowly1xnBuYbB6TQU4M72hg4TBmJf/AoIBAQDpCNtOHxXrMl3i0zN3MzIykn4o
// H4lXlG906UyzzMfkaILb+eQFLSk9N8DKfQnECtKIoOdtyWMSchaaBDR2qZNR8LQH
// 8FqOItkjxvo7qtJSbk0LWOlyHg+BwRJSTFau0z1MaDQPBlMxmPkJYjka3IKJGch2
// okswKQlsmOeEMlEKSCJSm+8WzTnU/K8oFZmcFcu3jIpKZ1JS0B+WD1vD7cGL0/FN
// o98eFxdUzjx0QPP41kaATCZJY7e8VJcnsGg3wQFgv09mcAv1/E93RnNHFMxJ/z9g
// RCQm/G4zvnnqMUNVeVYRCZ9xbD/KKxC11fnVtsUkc2pVvkHkhIvm8vbG9d7y
// -----END PGP PRIVATE KEY BLOCK-----`; // encrypted private key
// const passphrase = `bvjklesvfg854wyt859wnv8ynvw98wcmcowkjdw0`; // what the private key is encrypted with
//
// const publicKey =  openpgp.readKey({armoredKey: publicKeyArmored});
//
// const privateKey = openpgp.decryptKey({
//     privateKey: openpgp.readPrivateKey({armoredKey: privateKeyArmored}),
//     passphrase
// });
//
// export const encryptedText = (plainText) => {
//     const encrypted = openpgp.encrypt({
//         message: openpgp.createMessage({text: plainText}), // input as Message object
//         encryptionKeys: publicKey,
//         signingKeys: privateKey // optional
//     });
//     console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
//     return encrypted
// }
//
// export const decryptedText = (encryptedText) => {
//     const message = openpgp.readMessage({
//         armoredMessage: encryptedText // parse armored message
//     });
//     const {data: decrypted, signatures} = openpgp.decrypt({
//         message,
//         verificationKeys: publicKey, // optional
//         decryptionKeys: privateKey
//     });
//     console.log(decrypted); // 'Hello, World!'
//     // check signature validity (signed messages only)
//     // try {
//     //      signatures[0].verified; // throws on invalid signature
//     //     console.log('Signature is valid');
//     // } catch (e) {
//     //     throw new Error('Signature could not be verified: ' + e.message);
//     // }
//
// }
