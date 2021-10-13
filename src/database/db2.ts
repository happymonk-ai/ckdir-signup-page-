import level from "level-rocksdb";
import * as jsonld from "jsonld";
import { encodeBlock,generateKeyLessDID } from "../crypto/Auth";
import * as u8a from "uint8arrays";
import * as Block from "multiformats/block";
import * as codec from "@ipld/dag-cbor";
import { sha256 as hasher } from "multiformats/hashes/sha2";
import * as dagJose from "dag-jose";
import { createQuery } from "./utils/query";
import storage from "./store";
import {DateTime} from 'luxon'
import { randomBytes } from "@stablelib/random";

import { decodeCleartext, prepareCleartext } from "dag-jose-utils";

import { IMember } from "interface";
import MemberDocument from "Documents/MemberDocument";
import { nanoid } from "nanoid";

const memberContext = {
  did: "http://schema.org/identifier",
  name: "http://schema.org/name",
  email: "http://schema.org/email",
  telephone: "http://schema.org/telephone",
  memberOf: "http://schema.org/memberOf",
  relatedTo: "http://schema.org/person",
  owns: "http://schema.org/owns",
  image: { "@id": "http://schema.org/image", "@type": "@id" },
  knows: "http://schema.org/knows",
};

const memberDoc = {
  "http://schema.org/identifier": "",
  "http://schema.org/name": "Bhavish",
  "http://schema.org/email": "bhavish@happymonk.co",
  "http://schema.org/knows": [
    {
      "@id": "123",
      "http://schema.org/identifier":
        "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
    },
    {
      "@id": "124",
      "http://schema.org/identifier":
        "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
    },
  ],
};

const memberDoc2 = {
    "@id": nanoid,
    "@type":"Person",
    did: "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
    name: "Bhavish",
    email: "bhavish@happymonk.co",
    telephone:"+918296133177",
    knows: [
      {
        "@id": "123",
        name: "Daniele",
        did: "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
      },
      {
        "@id": "124",
        name: "Lucio",
        did: "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
      },
    ],
    worksfor:{
        "@id":"",
        "@type":"Organization"
    },
    previousLink:"",
  };

const organisationContext = {
  "@type": "Organisation",
  did: "http://schema.org/identifier",
  name: "http://schema.org/name",
  email: "http://schema.org/email",
  telephone: "http://schema.org/telephone",
  relatedTo: "http://schema.org/person",
  owns: "http://schema.org/owns",
  image: { "@id": "http://schema.org/image", "@type": "@id" },
  knows: "http://schema.org/knows",
};

const memberList = [
  {
    email: "bhavish@happymonk.co",
    phoneNumber: "+918296133177",
    deviceID: "did:key:z6MkqvdGBinpPgDCFttHTPvCwtwrXxip2UnUpSXAXtExDEqf",
    worksfor: {
      did: "",
    },
  },
  {
    email: "alka@happymonk.co",
    phoneNumber: "+919916084322",
    owns: [
      {
        devices: [
          {
            did: "did:key:13BGIUFB93872F78GH8927TBF7G273GR2BF287GF27B23GB872GTr872387R2G3R82735GR72823BFFOWECAW78B7",
          },
        ],
      },
    ],
    worksfor: {
      did: "",
    },
  },
  { 
    email: "cg@happymonk.co",
    phoneNumber: "+91991089222",
  },
];

const organsiation = {};

export enum DIDTYPES {
  MEMBER = "MEMBER",
  ORGANISATION = "ORGANISATION",
  DEVICE = "DEVICE",
  VISITOR = "VISITOR",
  FLEET = "FLEET",
  VEHICLE = "VEHICLE",
  AGENCY = "AGENCY",
  TEMPORARY = "TEMPORARY",
}

async function test() {
  try {
    const memberDIDList  = new Map<string,any>()
    memberList.map(async(member) => {
        const seed = randomBytes(32)
        console.log("Generating DID For",member);
        const mDid1 = await generateKeyLessDID(seed,member.phoneNumber);
        // storage.set()
        memberDIDList.set(member.phoneNumber,mDid1);
    });
    // const orgSeed = randomBytes(32)
    // const orgniastiondid = Auth.generateKeyLessDID(orgSeed,"something");
    
    // const memberBlock = generateBlock(payload,did,cid)
    console.log("Starting Rocks DB");
    let db = await level("./ckdr-t4", {
      createIfMissing: true,
      valueEncoding: "binary",
    });
    console.log("Generating Frame");
    const framed = await jsonld.compact(memberDoc,memberContext);
    console.log(JSON.stringify(framed, null, 2));

    encodeBlock(framed).then(async (block) => {
      const blockCID = block.cid.toString();
      console.log(block.value);
      console.log("Opening DB");
      await db.open();
      // console.log('Putting Value', block.value)
      await db.put("q.start", block.bytes, (err) => {
        if (err) throw err;
        console.log("Key Inserted");
      });
      console.log("Getting Value");
      await db.get("q.start", async (err, value) => {
        const block3 = await Block.decode({ bytes: value, codec, hasher });
        let ob2 = Object.create(block3)
        let ob = Object.assign({},block.value)
        Object.assign(ob,{
          timestamp:`${DateTime.now().toISO()}`,
          payload:'cid(1231jf891fh948fh974v97n497g8n2948fn98nf98n3598f3974fb9324nbf)',
          proof: generateProof(),
          previousBlockLink: block.cid
        })
        const newBlock= encodeBlock(ob)
    


        if (err) console.log(err);
        // const decodedPayload = await decodeCleartext(block3.value)
        // console.log(block)
        console.log(ob)
      });
    });
  } catch (error) {
    throw error;
  }
}
test().catch((err) => console.log);

function generateProof(){
  
}


const BLOCK_FRAME = {
  "http://www.chokidr.com": {
    "@context": [
      "http://schema.org/",
      "https://w3id.org/security/v2",
      "https://w3id.org/security/bbs/v1",
    ],
    "@version": 1.1,
  },
};



const PROOF_FRAME = {
  type: "BbsBlsSignatureProof2020",
  created: "2020-04-25",
  verificationMethod: "did:example:489398593#test",
  proofPurpose: "assertionMethod",
  proofValue:
    "kTTbA3pmDa6Qia/JkOnIXDLmoBz3vsi7L5t3DWySI/VLmBqleJ/Tbus5RoyiDERDBEh5rnACXlnOqJ/U8yFQFtcp/mBCc2FtKNPHae9jKIv1dm9K9QK1F3GI1AwyGoUfjLWrkGDObO1ouNAhpEd0+et+qiOf2j8p3MTTtRRx4Hgjcl0jXCq7C7R5/nLpgimHAAAAdAx4ouhMk7v9dXijCIMaG0deicn6fLoq3GcNHuH5X1j22LU/hDu7vvPnk/6JLkZ1xQAAAAIPd1tu598L/K3NSy0zOy6obaojEnaqc1R5Ih/6ZZgfEln2a6tuUp4wePExI1DGHqwj3j2lKg31a/6bSs7SMecHBQdgIYHnBmCYGNQnu/LZ9TFV56tBXY6YOWZgFzgLDrApnrFpixEACM9rwrJ5ORtxAAAAAgE4gUIIC9aHyJNa5TBklMOh6lvQkMVLXa/vEl+3NCLXblxjgpM7UEMqBkE9/QcoD3Tgmy+z0hN+4eky1RnJsEg=",
  nonce: "6i3dTz5yFfWJ8zgsamuyZa4yAHPm75tUOOXddR6krCvCYk77sbCOuEVcdBCDd/l6tIY=",
};


/**
 * Function To generate a json block
 * @param payload
 * @param did
 * @param cid
 */
async function generateBlock(payload, did, cid, secretKey) {
  const block = Object.assign(payload, { "@id": did, path: cid });
}

async function generateMemberBlock(payload: MemberDocument) {}
