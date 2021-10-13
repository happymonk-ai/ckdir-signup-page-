import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import { IDocument } from "./IDocument";

/**
 * Interface Defination for Vault Document
 *
 *
 *
 */
export interface IVaultDocument extends IDocument {
  id: string;
  did: string;
  timestamp: string;
  type: string;
  previousLink?: string;
  signature?: string;
  payload?: string;
  controller?: string;
  actions?: string[];
  created_at?: string;
}

/**
 * Interface defination for vehicle interface
 * Defines a vehicle Block
 */
export interface IVaultBlock extends IBlock {
  registrationID: string;
  isVerified: string;
  registrationType: string;
  registeredByDID: string;
  registrationVerificationBlock: {
    timestamp: string;
    id: string;
    content: {
      payload: string;
      verificiationPayload: string;
    };
    signature: string;
    organisationSignature: string;
    adminSignature: string;
  };
}

/**
 * Vault Interface. 
 * This should define all the payloads, parameters and associated details related to vault. 
 */
export interface IVault {
  id?: string;
  createdTimestamp: string;
  currentStakeHolder: string;
  sharingAuthority: string[];
  sharingHistory: {
    lastaccesstime: string;
    lastacessdid: string;
  };
  participantsList:string[]
  incidentid:string
  fleetid:string
  world:string
  location:string
  meta:string
  images:string
  videos:string
}
