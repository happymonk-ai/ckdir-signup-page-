import { CID } from "multiformats";
import { IBlock } from "./IBlock";
import {IDocument} from "./IDocument"




export interface IVehicleDocument extends IDocument {
    id:string
    did:string
    timestamp:string;
    type:string;
    fleetid:string;
    odid:string;
    driverDid:string;
    previousLink?:string;
    signature?:string;
    controller?:string;
    actions?:string[];
    payload?:string;
    created_at?:string;
    updated_at?:string;
}

/**
 * Interface defination for vehicle interface
 * Defines a vehicle Block
 * 
 */
export interface IVehicleBlock extends IBlock {
    document?:{
        registrationID:string
        isVerified:string
        registrationType:string
        registeredByDID:string
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
        trips:[{
            id:string
            driverDId:string
            startingPoint:string
            endingPoint:string
            locationHistory:CID
        }]
    }

}

export type IVehicle = {
    id:string
    did:string
    vin:string
    isVerified:boolean
    route:{
        currentRoute:{
            id:string
            state:string
            startTime:string
            endTime:string
            driverDid:string
            geo:{
                id:string
                latitude:string
                longitude:string
                craetedTime:string
                kinetic:boolean
            }
        }
        routingList:Map<string,string> // Map of id, routingID
    }
    vendor:{
        id:string
        name:string
        identificationId:string
        verified:boolean
    }
    ownedBy:{
        id:string
        did:string
        numberOfPreviousOwner:string
        previousOwner:string
    }
    incidentList:[{
        id:string
        did:string
    }]
    callSign:string
    type:string
    bodyType:string
    cargoVolume:string
    make:string
    mode:string
    gtin:string
    eventList:string[]
    activityList:string[]
    currentDriver:{
        id:string
        did:string
    }
    driverList:[{
        id:string
        type:string
        did:string
    }]
    vehicleRegistration:{
        id:string
        type:string
        verified:boolean
        registrationType:string
        registrationId:string
        registrationDocument:string // CID to the image of the document
        controller:string
        documentDid:string
        verificationType:string
        verificationAuthority:{
            id:string
            name:string
            controller:string
            key:string
            publicKey:string
            verificationLink:string
            nonce:string
            verificationType:string
        }
        proof?:any
    }
    location:{
        lastKnownLocation:{
            geo:{
                id:string
                latitude:string
                longitude:string
                kinetic:boolean
            }
        }
        currentLocation:{
            geo:{
                id:string
                latitude:string
                longitude:string
                kinetic:boolean
            }
        }
        locationList:{
            id:string
            sequence:number
            key:string
        }
    }

}