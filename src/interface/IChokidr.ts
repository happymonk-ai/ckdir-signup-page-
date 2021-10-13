import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import { IDocument } from "./IDocument";


/**
 * Chokidr Document 
 */
export interface IChokidrDocument extends IDocument {
  id: string;
  did: string;
  timestamp: string;
  type: string;
  odid: string;
  previousLink?: string;
  signature?: string;
  controller?: string;
  actions?: string[];
  payload?: string;
  created_at?: string;
  updated_at?: string;
  proof: any;
  
}

/**
 * Chokidr Block Format for Encrypted and Unecrypted Data
 */
export interface IChokidrBlock extends IBlock {
  id: string;
  sequence: number;
  type: string;
  timestamp: string;
  createdAt: string;
  controller: string | Uint8Array;
  payload: IChokidr;
}


/**
 * Chokidr interface
 */
export interface IChokidr {
  id: string;
  controller?:string;
  did?:string
  odid?:string
  organisation?:string;
  domain?:string
  agents: string[];
  spawnedAgents: string[];
  nearbyAgents: string[];
  currentConfidence: number;
  callname: string;
  status: string;
  mode?: string;
  coveredRegion?: string;
  peerList: string[];
  eventsList?: [
    {
      id: string;
      sequence: number;
      eventid: string;
    }
  ];
  notificationsList?: [
    {
      id: string;
      type: string;
      issuer: string;
      to: string;
      peerid: string;
      payload: string;
    }
  ];
  organisations?: [
    {
      id: string;
      did?: string;
      blockcid?: string;
    }
  ];
  members?: [
    {
      id: string;
      did?: string;
      blockcid?: string;
      key?: string;
      nuance?: string;
      salt?: string;
    }
  ];
  bank?: {
    wallet?: string;
    fees?: string;
    totalfeesCollected?: string;
    lastTransactionId?:string
  };
}
