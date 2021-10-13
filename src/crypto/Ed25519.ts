import {
    generateKeyPairFromSeed,
    KeyPair as EncryptionKeyPair,
  } from "@stablelib/x25519";

export default class Ed25519 {
    readonly keypair
    constructor(seed:Uint8Array){
        this.keypair = this.getKeys(seed);
    }
    getKeys(seed:Uint8Array){
        return generateKeyPairFromSeed(seed);
    }

    sign(sharedKey:string, nonce:string, parameters?:any){
        return null 
    }
}