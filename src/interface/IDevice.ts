import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import {IDocument} from "./IDocument"

export interface IDeviceDocument{
    id?:string
    did?:string
    timestamp?:string;
    type?:string;
    odid?:string;
    signature?:string;
    controller?:Uint8Array;
    created_at?:string;
    actions?:string[];
    previousLink?:string;
    payload?:IDeviceBlock | string
    proof?:any
}

export interface IDeviceBlock{
    id:string
    name?:string
    physicalId?:string
    systemId?:string
    status?:string
    permissionLevel?:string
    accessLevel?:string
    role?:string
    payload:IDevice | string
}

export type IDevice = {
    id:string
    did:string
    type:string
    timestamp:string
    latitude:number
    longitude:number
}