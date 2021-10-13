import { CID } from "multiformats";
import { JWE } from "./jwe";

/**
 * Basic Block Defination
 * Reference From confidential Storage for Encrypted Data storage format. 
 * 
 * https://identity.foundation/confidential-storage/
 * 
 * Block Storage : Can be Encrypted Payload, Open Payload or JWE Depending on the Instance.
 * 
 * 
 */
export default interface IBlock extends Record<string,any> {
  id: string; // Block ID 
  sequence?: number;
  controller?: string | Uint8Array;
  timestamp?: string;
  signature?: string | Uint8Array;
  meta?: {
    created_at?: string;
    updated_at?: string;
    contentType?:string;
    contentLength?:string
  };
  index?:[{
      sequence: number;
      hmac:{
          id:string
          type:string
      },
      attributes:[{
          name: string
          value: string
          unique:boolean
      }]
  }]
  stream?: {
    id: string;
    jwe?:JWE
  };
  previousLink?: string | CID;
  payload?: any;
  jwe?:JWE
}
