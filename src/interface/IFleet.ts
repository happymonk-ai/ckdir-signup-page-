import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import { IDocument } from "./IDocument";

/**
 * Interface Fleet Document Structure
 */
export interface IFleetDocument  extends IDocument{
    id:string
    did:string
    timestamp:string;
    type:string;
    odid:string;
    peerdid:string;
    ckdrdid:string
    previousLink?:string;
    signature?:string;
    payload?:string;
    controller?:string;
    actions?:string[];
    created_at?:string;
    updated_at?:string
    document?:IFleet
    proof?:{}
}


/**
 * Interface defination for vehicle interface
 * Defines a vehicle Block
 * Fleet Block That gets updated for every Fleet In the System
 */
export interface IFleetBlock extends IBlock {
    registrationID:string
    isVerified:string
    registrationType:string
    registeredByDID:string
    vehicleList:string[]
    trips:[{
        id:string
        driverDId:string
        startingPoint:string
        endingPoint:string
        locationHistory:CID
    }]
    registrationVerificationBlock:{
        timestamp:string
        id:string
        content:{
            payload:string
            verificiationPayload:string
        }
        signature:string
        organisationSignature:string
        adminSignature:string
    }
}

export interface IFleet{
    id:string //uuid of the document
    type:string
    startDate:string
    endDate:string
    client:string
    driverdid:{
        id:string
        did:string
    }
    name:string
    vehicleInformation:{
        name:string
        make:string
        model:string
        trim:string
        type:string
        registrationNumber:string
        vin:string
        meta:any
        gtin?:string
    }
    lastKnownLocation:{
        id:string
        geo:{
            type:string
            latitude:string
            longitude:string
        }
    }
    trip:{
        tripStartTime:string
        tripEndTime:string
        geo:{
            id:string
            type:string
            latitude:string
            longitude:string
            kinetic:boolean
            updatedTime:string
        }

    }
    originEndTime:string
}