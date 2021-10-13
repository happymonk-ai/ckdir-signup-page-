import { CID } from "multiformats";
import { IBlock } from "./IBlock";

import { IDocument } from "./IDocument";

export interface IOrganisationDocument extends IDocument {
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
  _content: {
    id: string;
    did: string;
    members?: string;
    visitors?: string;
    fleet?: string;
    vehicles?: string;
    locations?: string;
    devices?: string;

    signatures?: {};
    alsoKnownAs?: string;

    subscriptions?: {
      id: string;
      information: Object;
    };
    payments?: {
      subscriptionsInformation: string;
    };
    previousDocument?: string;
    updateTime?: string;
    createdTime?: string;
  };
}

/**
 * Interface defination for vehicle interface
 * Defines a vehicle Block
 *
 */
export interface IOrganisationBlock extends IBlock {
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

export interface IOrganisation {
  id: string;
  did: string;
  showname?: string;
  members?: {}[];
  visitors?: string;
  fleet?: string;
  vehicles?: string;
  locations?: string;
  devices?: string;

  signatures?: {};
  alsoKnownAs?: string;

  subscriptions?: {
    id: string;
    information: Object;
  };
  payments?: {
    subscriptionsInformation: string;
  };
  previousDocument?: string;
  updateTime?: string;
  createdTime?: string;
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
  addMembers(did: string, addedByDid?: string);
  addVisitors(did: string, addedByDid?: string);
  addVehicles(did: string, addedByDid?: string);
  addLocations(did: string);
  addDevices(did: string, locationDid?: string, adminDid?: string);
  addActivities(ipnsLink: string);
  addNotifications(ipnsLink: string);
  addPaymentVerfication(
    did: string,
    adminDid?: string,
    verificationInformationObject?: Object
  );
  addSubscriptions(id: string, information?: Object);
  addPaymentInformation(id: string, information?: Object);

  removeMember(did: string, adminDid?: string);
  removeVehicles(did: string, adminDid?: string);
  removeLocations(did: string, adminDid?: string);
  removeDevices(did: string, locationDid?: string, adminDid?: string);
  updateSubscription(id: string, information?: {});
  updatePayment(id: string, information?: {});
}
