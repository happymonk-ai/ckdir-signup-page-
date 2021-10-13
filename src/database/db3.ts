var level = require("level"),
  yourDB = level("./ckdr"),
  levelgraph = require("levelgraph"),
  jsonld = require("levelgraph-jsonld"),
  opts = { base: "http://happymonk.co/b" },
  db = jsonld(levelgraph(yourDB, opts));


import { nanoid } from ".pnpm/nanoid@3.1.25/node_modules/nanoid";
import { Person, Organization, WithContext } from "schema-dts";
import EventEmitter from "eventemitter3";

import * as jld from "jsonld";
import { encodeBlock } from "crypto/Auth";

const member = {
  "@context": {
    did: "http://xmlns.com/foaf/0.1/identifier",
    name: "http://xmlns.com/foaf/0.1/name",
    worksfor: "http://xmlns.com/foaf/0.1/worksfor",
  },
  "@id":
    "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
  verified: "true",
};

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
  "http://schema.org/identifier":
    "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
  "http://schema.org/name": "Bhavish",
  "http://schema.org/email": "bhavish@happymonk.co",
  "http://schema.org/knows": [
    {
      "@id": "123",
      "http://schema.org/name": "Daniele",
      "http://schema.org/identifier":
        "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
    },
    {
      "@id": "124",
      "http://schema.org/name": "Lucio",
      "http://schema.org/identifier":
        "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
    },
  ],
};

const organisationContext = {};

export interface IDBConfig {
  uri: string;
  cache?: boolean;
  master?: boolean;
  etcd?: {
    url: string;
    master: boolean;
    port: string[];
  };
  ipfs?: {
    peerID?: string;
    publicKey?: string;
    secretKey?: string;
  };
  sync?: boolean;
}

async function test() {
  var chokidr = {
    "@context": {
      name: "http://xmlns.com/foaf/0.1/name",
      homepage: {
        "@id": "http://xmlns.com/foaf/0.1/homepage",
        "@type": "@id",
      },
    },
    "@id": "http://chokidr.ml#person",
    name: "chokidr",
    homepage: "http://chokidr.ml/",
  };
  var nested = {
    "@context": {
      name: "http://xmlns.com/foaf/0.1/name",
      knows: "http://xmlns.com/foaf/0.1/knows",
    },
    "@id": "http://chokidr.com",
    name: "Happymonk",
    owns: [
      {
        name: "Happymonk",
      },
      {
        name: "Dekroater",
      },
    ],
  };
  var manu = {
    "@context": {
      "@vocab": "http://xmlns.com/foaf/0.1/",
      homepage: { "@type": "@id" },
      knows: { "@type": "@id" },
      based_near: { "@type": "@id" },
    },
    "@id": "http://manu.sporny.org#person",
    name: "Manu Sporny",
    homepage: "http://manu.sporny.org/",
    knows: [
      {
        "@id": "https://my-profile.eu/people/deiu/card#me",
        name: "Andrei Vlad Sambra",
        based_near: "http://dbpedia.org/resource/Paris",
      },
      {
        "@id": "http://melvincarvalho.com/#me",
        name: "Melvin Carvalho",
        based_near: "http://dbpedia.org/resource/Honolulu",
      },
      {
        "@id": "http://bblfish.net/people/henry/card#me",
        name: "Henry Story",
        based_near: "http://dbpedia.org/resource/Paris",
      },
      {
        "@id": "http://presbrey.mit.edu/foaf#presbrey",
        name: "Joe Presbrey",
        based_near: "http://dbpedia.org/resource/Cambridge",
      },
    ],
  };
  var paris = "http://dbpedia.org/resource/Paris";

  try {
    // const compacted = await jld.compact(memberDoc, memberContext);
    // // console.log(JSON.stringify(compacted, null, 2))
    // const canonized = await jld.canonize(memberDoc, {
    //     algorithm: 'URDNA2015',
    //     format: 'application/n-quads'
    // });
    // const framed = await jsonld.frame(memberDoc, memberContext);
    // console.log(JSON.stringify(framed, null, 2))
    // // console.log(canonized)
    // db.jsonld.put(nested, (err, obj) => {
    //     if (err) console.error(err)
    //     else console.log('Stored Object', obj);
    // });
  } catch (error) {
    throw error;
  }
}
test().catch((err) => console.log);


// var incident = {
//   "@context": ['http://schema.org'],
//   "@id": nanoid(24),
//   "@type": "Incident",
//   payload: {
//     incident_id: 'id+timestamp',
//     incident_type: "collision",
//     organisation_DID: "101",
//     location_id: "10001",
//     timestamp: "1594823426.159446",
//     conversation:cid(oZ294fhn4857vn02rvp7n3v72583nvpqwury8gnb5678) // Name Key
//   },
//   proof: {

//   },
//   createdtime: "2014-02je098j8",
//   updatedtime: "",
//   previousBlock: "",
// };

// var cid = await encodeBlock(incident)


// db.put(`sop::organisation::has::incident::1234u1rjn891nfd9783ne::${cid.cid}`, cid.bytes)
// db.get(`sop::organisation::has::incidenty::1234u1rjn891nfd9783ne::`)
// creatReadSteam({
//   gt:`sop::organisation::has::incidenty::1234u1rjn891nfd9783ne::`,
//   lt::`sop::organisation::has::incidenty::1234u1rjn891nfd9783ne::${upperBoundChar}`
// }).then(data=>{
//   const values = split(key,"::")
//   verifydid(value[5])
//   verifycid(value[6]);
//   send(value)
//   getIncidentList()

//   // Updating a block with a new message. This
//   const block = data.value
//   block = updateConversation(message)
//   const updateBlock = patch(block,{
//     updatetime: new Date
//     previousBlock : block.cid
//     payload:{
//       block
//     }
//   })
//   db.put(key,value)

//   previousBlock(value.previousBlock)
// })


// async function updateConversation(key,message){
//   const block = await encodeBlock(message)
//   const namekey = ipfs.name.pubsub(key, block.cid)
// }



