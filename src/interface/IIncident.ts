import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import { IDocument } from "./IDocument";
import { IChat } from "./iChat";
import {JWE} from "./jwe";
/**
 * Interface Defination for Incident Document
 * 
 */
export interface IIncidentDocument extends IDocument {
  id: string;
  did: string;
  botid?: string;
  timestamp?: string;
  type?: string[];
  odid?: string;
  previousLink?: string;
  signature?: string;
  controller?: Uint8Array;
  created_at?: string;
  actions?: string[];
  payload?: IIncidentBlock;
  proof?:any
}

/**
 * Interface defination for vehicle interface
 * Defines a vehicle Block
 *
 */
export interface IIncidentBlock extends IBlock {
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
  index:[{
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
  type: string;
  previousBlock?: string;
  block: IIncident;
}

/**
 * Incident Interface 
 * Document for defination
 * https://docs.google.com/spreadsheets/d/1IuWXP5Shk5pFFVF6Yz1cABGUHBzD8ca4BqDGsnl3Vag/edit#gid=1870573701
 * 
 * 
 */
export interface IIncident {
  id: string; // UUID string
  description: string; // Description of the incident Block
  type: string;
  registrationType?: string;
  registeredByDID?: string;
  peopleInvolvedDid?: string;
  adminDid?: string;
  organisationdid?: string;
  intialData?: {
    location: {
      id: string;
      latitude: number;
      longitude: number;
      direction: number;
      timestamp: string;
    };
    media: {
      id: string;
      timestamp: string;
      devicedid: string;
      meta: {
        mediatype: string;
      };
      link: {};
    };
  };
  isVerified?: string;
  meta?: {};
  incident?: {
    id: string;
    type: string;
    locationid: string;
  };
  vehicleInformation?: {
    id: string;
    registrationNumber: string;
  };
  chatInformation?: {
    id: string;
    conversation: IChat[];
  };
  media?: {
    id: string;
  };
  registrationVerificationBlock?: {
    timestamp: string;
    id: string;
    content: {
      payload: string;
      verificiationPayload: string;
    };
    signature: string;
    organisationSignature: string;
    adminSignature: string;
    ckdrSignature: string;
    controller: string[];
    proof: string;
    nonce: string;
    verificationType: string;
    verificationMethod: string;
  };
}
