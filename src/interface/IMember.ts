import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import { IDocument } from "./IDocument";
import {JWE} from "./jwe"
/**
 * Interface defination for vehicle interface
 * Defines a vehicle Block
 *
 */
export type IMember = {
  id?: string;
  did?:string
  keypair?:any
  controller?:string

  // access details
  accessFailCount?:number
  totalLoginCount?:number
  lastLoginTime: string;
  lastLoginLocation:string
  lockoutEnabled:boolean
  lockend:boolean


  // generic detailss
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  email?: string;
  description?:string

  // Gas fees details
  balance?: string;
  lastFeePaid?: string;
  lastTransactionTime?: string;

  status?: string;
  isActive?: string;
  isVerified?: string;
  verificationStatus?: string;

  // Government Context Definations
  governmentId: [
    {
      id: string;
      type: string;
      url: string;
      verified: string;
      proof: string;
      createdTime: string;
    }
  ];

  // image links 
  images: [
    {
      id: string;
      url: string; // cid of the document in the storage
    }
  ];
  media:[{
      id?:string
      payload?:string
      jwe?:string
  }]
  address: {
    id: string;
    type?: string;
    value?: string;
    geo?: {
      latitude: string;
      longitude: string;
    };
  };
  devices?: {
    id: string;
    did: string;
    lastLoginTime: string;
    lastUpdateTime: string;
  };
  primaryDevice: string;
  registrationID?: string;
  registrationType?: string;
  registeredByDID?: string;
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
  };

  worksfor: string;
  lastWorkingCompany: string;
  incidents: [
    {
      id: string;
      did: string;
      timestamp: string;
      controller: string;
      isadmin?: string;
      isPrimaryContact?: string;
      isAgency: string;
    }
  ];
  relatedTo: [
    {
      id: string;
      did: string;
      as: string;
    }
  ];
  notifications: [
    {
      id: string;
      createdAt: string;
      notified: boolean;
      channel: string;
      documentId: string;
      deviceId:string
    }
  ];
  contracts: [
    {
      id: string;
      document: string;
    }
  ];
  wallet: [
    {
      id: string;
      document: string;
      updateTime: string;
      transactionId: string;
    }
  ];
  // define all the functions
  addOrganisation(did: string);
  addRole(role: string);
  addDevice(did: string);
  updateOrgansiation(did: string, adminDid: string, role: string);
  updateRole(did: string, role: string);
  updateDevice(did: string, deviceMetaInformation?: {});
}

/**
 * Interface for MemberBlock
 */

export interface IMemberBlock extends IBlock {
  id: string; // Block ID
  sequence?: number;
  controller?: string | Uint8Array;
  timestamp?: string;
  signature?: string | Uint8Array;
  meta?: {
    created_at?: string;
    updated_at?: string;
    contentType?: string;
    contentLength?: string;
  };
  index: [
    {
      sequence: number;
      hmac: {
        id: string;
        type: string;
      };
      attributes: [
        {
          name: string;
          value: string;
          unique: boolean;
        }
      ];
    }
  ];
  stream?: {
    id: string;
    jwe?: JWE;
  };
  previousLink?: string | CID;
  payload?: any;
  jwe?: JWE;
}

/**
 * Interface for MemberDocument
 */
export interface IMemberDocument extends IDocument {
  id: string;
  did: string;
  timestamp: string;
  type: string;
  fleetdid: string;
  odid: string;
  driverDid: string;
  previousLink?: string;
  signature?: string;
  payload?: string;
  controller?: string;
  actions?: string[];
  created_at?: string;
}
