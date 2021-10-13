import * as keygen from 'bls12-381-keygen'
import BLS from '../crypto/BLS';
import chalk from 'chalk';
import { randomBytes } from '@stablelib/random';
import { DateTime } from 'luxon';
import * as bls from 'noble-bls12-381';
import { nanoid } from 'nanoid';
import * as u8a from 'uint8arrays';
import Promise from 'bluebird';
import { generateKeyPairFromSeed, KeyPair } from '@stablelib/x25519'
import {Bls12381KeyPairs} from '../crypto/BLS';
import { XChaCha20Poly1305 } from '@stablelib/xchacha20poly1305'

import * as bip39 from 'bip39';

import {
    xc20pDirEncrypter,
    xc20pDirDecrypter,
    x25519Encrypter,
    x25519Decrypter,
    decryptJWE,
    createJWE,
    JWE
} from 'did-jwt';
import {
    decodeCleartext,
    prepareCleartext
} from 'dag-jose-utils';

import * as Block from 'multiformats/block';
import { sha256 } from 'multiformats/hashes/sha2';
import * as dagJose from 'dag-jose';

import db from '../database/InMemoryDatabase';
import { sharedKey } from '@stablelib/x25519'
import { hash } from '@stablelib/sha256'

import { keccak_256 } from 'js-sha3' // eslint-disable-line

export type ECDH = (theirPublicKey: Uint8Array) => Promise<Uint8Array>

/**
 * Wraps an X25519 secret key into an ECDH method that can be used to compute a shared secret with a public key.
 * @param mySecretKey A `Uint8Array` of length 32 representing the bytes of my secret key
 * @returns an `ECDH` method with the signature `(theirPublicKey: Uint8Array) => Promise<Uint8Array>`
 *
 * @throws 'invalid_argument:...' if the secret key size is wrong
 */
export function createX25519ECDH(mySecretKey: Uint8Array): ECDH {
  if (mySecretKey.length !== 32) {
    throw new Error('invalid_argument: incorrect secret key length for X25519')
  }
  return async (theirPublicKey: Uint8Array): Promise<Uint8Array> => {
    if (theirPublicKey.length !== 32) {
      throw new Error('invalid_argument: incorrect publicKey key length for X25519')
    }
    return sharedKey(mySecretKey, theirPublicKey)
  }
}

function writeUint32BE(value: number, array = new Uint8Array(4)): Uint8Array {
    const encoded = u8a.fromString(value.toString(), 'base10')
    array.set(encoded, 4 - encoded.length)
    return array
  }
  
  const lengthAndInput = (input: Uint8Array): Uint8Array => u8a.concat([writeUint32BE(input.length), input])
  
  // This implementation of concatKDF was inspired by these two implementations:
  // https://github.com/digitalbazaar/minimal-cipher/blob/master/algorithms/ecdhkdf.js
  // https://github.com/panva/jose/blob/master/lib/jwa/ecdh/derive.js
  export function concatKDF(
    secret: Uint8Array,
    keyLen: number,
    alg: string,
    producerInfo?: Uint8Array,
    consumerInfo?: Uint8Array
  ): Uint8Array {
    if (keyLen !== 256) throw new Error(`Unsupported key length: ${keyLen}`)
    const value = u8a.concat([
      lengthAndInput(u8a.fromString(alg)),
      lengthAndInput(typeof producerInfo === 'undefined' ? new Uint8Array(0) : producerInfo), // apu
      lengthAndInput(typeof consumerInfo === 'undefined' ? new Uint8Array(0) : consumerInfo), // apv
      writeUint32BE(keyLen),
    ])
  
    // since our key lenght is 256 we only have to do one round
    const roundNumber = 1
    return hash(u8a.concat([writeUint32BE(roundNumber), secret, value]))
  }


const main = async () => {
    const bytes = randomBytes(32);
    const seed = bip39.entropyToMnemonic(Buffer.from(bytes).toString('hex'));
    const entropy = bip39.mnemonicToEntropy(seed);
    console.log(seed);
    console.log(entropy);
    const organisationSeed = randomBytes(32);
    const ckdrseed = randomBytes(32);
    const message = Object.assign({
        id: nanoid(24),
        timestamp: DateTime.DATETIME_FULL_WITH_SECONDS,
        payload: {
            message: 'Hello'
        }
    });
    const m = '64726e3da8';
    try {
        console.log('Deriving Key')
        // const privateKey = keygen.deriveSeedTree(bytes, 'm/12381/3600/0/0/0');
        // const publicKey = bls.getPublicKey(privateKey)
        // const signature = await bls.sign(u8a.fromString(m), privateKey);
        // console.log('Generating Signatures')
        // const signature2 = await bls.sign(u8a.fromString(message), privateKey);
        // console.log('Signature', signature)
        // console.log('Signature2', signature2)
        // console.log('Veriyfing Signatures');
        // bls.verify(signature2, u8a.fromString(message), publicKey).then((value) => {
        //     console.log(value)
        // }).catch(err => console.error(err));
        console.log('Generating third Keypair')
        const blsKey = new BLS();
        var signatureKeypair
        blsKey.generateBLSDID(bytes).then(async (d) => {
            console.log('Keypair', d);
            console.log('SignatureKeypair', signatureKeypair)
            console.log('Generating SecretKeypair')
            const encryptionKeys:KeyPair = await generateKeyPairFromSeed(bytes);
            console.log('Keypair Generated')
            console.log('Intiating Device')
            const deviceData = {
                did: '',
                location: ['75.4', '13.213']
            }
            console.log('Encrypting payload');
            const jwe = await encrypt(deviceData, encryptionKeys,[]);
            console.log('Signing Payload', jwe);
            const signature = await bls.sign(u8a.fromString(jwe), d.privateKey)
            const verified = await bls.verify(signature, u8a.fromString(jwe), d.publicKey);
            if (verified) console.log('verified', u8a.toString(signature))
            else console.log('Not Verified');
        })

    } catch (error) {
        throw error;
    }
}


main().catch(err => {
    console.log();
})


/**
 * CKDR DID 'did:key:{format}:edpubkeybase64:blspubkeybase64'
 */

const deviceDid = async () => {

    const deviceDID = "did:key:00xCD:z124679AKSUD897698J8G1GB0GC:xH98014NB87GHB87G8G87817B87B173FB83978FB79FB7B3F7982FHB779BH1987BD7BD87B18787QBWD8B7"
    // EDKeypair 
    const deviceEncryptionKey = {}
    // BLSKEyPair
    const deviceSigningKey = {}
}


/**
 * Encrypt the payload 
 * @param payload 
 * @param encryptionKeyPair 
 * @returns 
 */
const encrypt = async (payload, encryptionKeyPair:KeyPair, receipientPubicKey) => {
    return new Promise(async (resolve, reject) => {
        try {
            const asymEncrypter = x25519Encrypter(encryptionKeyPair.publicKey);
            const clearText = await prepareCleartext(payload);
            const jwe = await createJWE(clearText, [asymEncrypter]);
            resolve(jwe);
        } catch (error) {
            reject(error)
        }
    })
}


const signSingleKey = async (jwe:JWE, signingKeyPair:Bls12381KeyPairs) => {
    return new Promise(async (resolve, reject) => {
        try {
            const signature = await bls.sign(u8a.fromString(jwe.protected), signingKeyPair.privateKey)
            const verified = await bls.verify(signature, u8a.fromString(jwe.protected), signingKeyPair.publicKey);
            if (verified)
                resolve(signature);
            else
                reject('Unable to verify signature for the keypair')
        } catch (error) {
            reject(error)
        }
    });
}

// ClientSide
const decrypt = async (payload, decryptionKeyPair:KeyPair) => {
    const asymDecrypter = x25519Decrypter(decryptionKeyPair.secretKey);
    const decrypedData = await decryptJWE(payload,asymDecrypter);
    return decodeCleartext(decrypedData);
}

// Serverside

// ServerSide signature verification
const signatureVerification = async (signature, payload, publicKeys) => {
    return new Promise(async (resolve,reject)=>{
        try {
            const signedValue = await bls.verify(signature, payload, publicKeys);            
            resolve(signedValue);
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Sign Payload with the given PrivateKey and Verify with the given PublicKeypair
 * 
 * @param payload Array of Payload in JSON format that needs to be signed. 
 * @param keypair BLSG1Keypair of payload to sign the given message
 * @param publicKeys PublicKeypair of signature to be verified with
 * @returns 
 */
const signPayload = async (payload:Map<string,any>[], keypair:Bls12381KeyPairs[], publicKeys?:string[]) => {
    return new Promise((resolve, reject) =>{
        try {
            if(payload.length == 1){ 
                console.log('Signing Single Message with the publicKeyt');

            }else{
                console.log('Signing Multiple Messages with Multiple Keys');
            }
        } catch (error) {
            reject(error);
        }
    });
}
