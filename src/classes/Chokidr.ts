import { DateTime } from "luxon";
import { IChokidr } from "../interface/IChokidr";
import { loadConfig } from "../config";
import { nanoid } from "nanoid";
import { IMember } from "../interface/IMember";
import { IOrganisation } from "../interface/IOrganisation";

const config = loadConfig();

/**
 * Chokidr Class Defination.
 *
 * Instantiate a class
 * import Chokidr from '.' // replace from the directory in the required folder
 * //Get a class of the ckdr from the Director. Do not create a instance directly
 * const ckdr = Chokidr.load(opts)
 *
 */
export class Chokidr implements IChokidr {
  id: string;
  agents: string[];
  mode: string;
  spawnedAgents: string[];
  nearbyAgents: string[];
  currentConfidence: number;
  callname: string;
  status: string;
  coveredRegion: string;
  peerList: string[];
  eventsList: [{ id: string; sequence: number; eventid: string }];
  notificationsList: [
    {
      id: string;
      type: string;
      issuer: string;
      to: string;
      peerid: string;
      payload: string;
    }
  ];
  organisations: [{ id: string; did: string; blockcid: string }];
  members: [
    {
      id: string;
      did?: string;
      blockcid?: string;
      key?: string;
      nuance?: string;
      salt?: string;
    }
  ];
  bank: {
    wallet: string;
    fees: string;
    totalfeesCollected: string;
    lastTransactionId?: string;
  };
//   Setup the default payload when the class is created
  constructor(payload?: IChokidr) {
    this.id = nanoid(24);
    if (payload) {
      if (this.agents.length == 0) {
        this.agents.push(payload.agents.pop());
      }
    }
  }

  setMember(member: IMember) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.members) {
          this.members = [
            {
              id: nanoid(24),
              did: "",
              blockcid: "",
            },
          ];
        }
        if (!member.did) throw new Error("Member DID not specified");
        this.members.push(
          Object.create({
            id: nanoid(24),
            did: member.did,
          })
        );
        resolve(JSON.stringify(this.members));
      } catch (error) {
        reject(error);
      }
    });
  }

  setOrganisation(organisation?: IOrganisation) {
    if (!this.organisations) {
      this.organisations = [
        {
          id: nanoid(24),
          did: "",
          blockcid: "",
        },
      ];
    }
    if (organisation) {
      this.organisations.push({
        id: nanoid(24),
        did: organisation.did,
        blockcid: "",
      });
    }

    return JSON.stringify(this.organisations);
  }
  getJSON() {
    return Object.assign(
      {},
      {
        id: this.id,
        callname: this.callname,
        agents: this.agents,
        spawanedAgents: this.spawnedAgents,
        currentConfidence: this.currentConfidence,
        nearbyAgents: this.nearbyAgents,
        status: this.status || "Undefined",
        peerList: this.peerList || "Undefined",
        membersList: this.members || "Undefined",
        organisationList: this.organisations || "Undefined",
        notificationsList: this.notificationsList || "Undefined",
        members: this.members || "Undefined",
        bank: this.bank,
      }
    );
  }
}
