import { nanoid } from "nanoid";
import chalk from "chalk";
import EventEmitter from "eventemitter3";
import BLS from "../crypto/BLS";
import * as u8a from "uint8arrays";
import { randomBytes } from "@stablelib/random";
import { BlsKeyPair } from "@mattrglobal/bbs-signatures";
import * as PeerId from "peer-id";
import EnvConfig from "../config";
import { DateTime } from "luxon";
import { singleton } from "tsyringe";
import ChokidrDocumentManager from "../DocumentManager/ChokidrDocumentManager";
import DBFactory from "../bootstrap/DbFactory";
import * as dagJose from "dag-jose";
import * as dagCbor from "@ipld/dag-cbor";
import { sha256 } from "multiformats/hashes/sha2";
import { base64 } from "multiformats/bases/base64";
import {
  createJWT,
  EdDSASigner,
  Signer,
  Encrypter,
  Decrypter,
  x25519Decrypter,
  x25519Encrypter,
} from "did-jwt";
import Invitation from "../classes/Invitation";
import Signup from "../classes/Signup";       
import { Block } from "multiformats/block";
import { decodeCleartext, prepareCleartext } from "dag-jose-utils";
import * as DAG from "multiformats/block";
import * as box from "tweetnacl";

/**
 * Create a db instance seperately for chokidr
 * This is only for ckdr instance. Do not export the db and use across the system.
 * Whynot use sublevel and split the same db instance in memory? Security?
 */

type ckdrEvent = "STARTING" | "RUNNING" | "SYNCING";

interface BaseKeyPair {
  readonly publicKey: Uint8Array;
  readonly secretKey: Uint8Array;
}

export type ckdrOptions = {
  mode?: string;
  version?: string;
  enablecli?: boolean | string;
  name?: string;
  enablefrontend?: boolean | string;
  mediaserver?: {
    enableauthentication: boolean | string;
    rtmp: boolean | string;
    rtsp: string | boolean;
    publickey: string;
    privatekey: string;
  };
  httpsenabled?: boolean | string;
  publickey?: string | "";
  privatekey?: string | "";
};

const keys = {
  "chokidr.seed": "::ckdr::seed::",
  "chokidr.seed.init": "::ckdr::seed::init::test3",
  "chokidr.seed.basekey": "::ckdr::seed::basekey::",
  "chokidr.seed.peerid": "::ckdr::seed::peerid::",
  "chokidr.seed.isset": "::ckdr::seed::isset::",
  "chokidr.seed.publickey": "ckdr::seed::publickey::",
  "chokidr.seed.privatekey": "ckdr::seed::privatekey::",
  "chokidr.seed.cid": "ckdr::seed::cid::",
  "chokidr.invitations.id": "ckdr::invitations::id::",
  "chokidr.invitations.data": "ckdr::invitations::data::",
  "chokidr.invitations.phonenumber": "ckdr::invitations::phonenumber::",
  "chokidr.invitations.email": "ckdr::invitations::email::",
  "chokidr.invitations.block": "ckdr::invitations::block::",
  "chokidr.signup.id": "ckdr::signup::id",
  "chokidr.signup.Name": "ckdr::sign::Name",
  "chokidr.signup.date:":"ckdr::signup::date",
  "chokidr.signup.PhoneNumber": "ckdr::signup::PhoneNumber ",
  "chokidr.signup.Email": "ckdr::signup::Email",
  "chokidr.signup.block:":"ckdr::signup::block",

};

const getKeyForCID = (cid: string) => {
  return `${keys["chokidr.seed.cid"]}${cid}`;
};

/**
 * Chokidr Service
 * ChokidrService.init()
 *
 *
 */
@singleton()
export default class ChokidrService extends EventEmitter {
  private _seed: Uint8Array;
  private _peerID: PeerId;
  private version: string;
  private currentState: ckdrEvent;
  private defaultOptions: ckdrOptions = {};
  private controller: Uint8Array;
  private _id: string;
  private _createdTime: string;
  private _lastStopTime: string;
  private _did: string;
  private _signatureKeyPair: BlsKeyPair;
  private _encryptionKeyPair;
  private readonly _documentManager: ChokidrDocumentManager;
  private signer: Signer;
  private encrypter: Encrypter;
  private decrypter: Decrypter;

  // Define details.
  _db;

  constructor(
    private readonly envConfig: EnvConfig,
    private readonly dbFactory: DBFactory
  ) {
    super();
    this._id = nanoid(32);
    this._createdTime = DateTime.now().toISO();
    this.defaultOptions = envConfig.ckdr;
  }

  /**
   * Returns the ID of the ChokidrService Instance
   */
  get id() {
    return this._id;
  }

  /**
   * Returns the createdTime of the ChokidrService Instance
   */
  get createdTime() {
    return this._createdTime;
  }

  /**
   * Get the lastStopTime of the system
   */
  get lastStopTime() {
    return this._lastStopTime;
  }

  /**
   * Get PeerId of the current Chokidr Instance
   */
  get peerID() {
    return this._peerID;
  }

  /**
   * Service Bootstrap Function
   * @returns
   */
  bootstrap = async (): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (this._db)
          throw new Error("[ChokidrService] Database Already Intiialized");
        if (!this.dbFactory.db)
          throw new Error("[ChokidrService] Database Factory not Intialized");
        console.log("[ChokidrService] Getting Database Instance");
        this._db = this.dbFactory.db;
        if (!this._db)
          throw new Error(
            "[ChokidrService] Unable to reach inmemory db ... Please try again "
          );
        await this.initkeys();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Start ChokidrService.
   * Checks if the database is open, if not, opens the database and intitizlizes the did and default
   * signer and encrypter functions that are required
   * @returns
   */
  start = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (this._db) {
          if (!this._db.isOpen()) {
            await this._db.open();
          }
          await this.initSigners();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Stop Services That are started by chokidr services
   *
   */
  stop = async () => {
    // update the base document
    if (this._db && this._db.isOpen()) {
      console.log("Closing BD");
      this._db.close();
    }
    this._lastStopTime = DateTime.now().toISO();
    await this.stopDocumentManager();
  };

  /**
   * Intilize the encrypter and decrypter functions
   * Creates a signer function
   * Creates a encrypter function
   * Creates a decryper instance
   */
  initSigners = async () => {
    if (!this._signatureKeyPair) throw new Error("Signature keypair not found");

    this.signer = EdDSASigner(this._encryptionKeyPair.secretKey);
    if (!this.signer) throw new Error("Signer Function Not set");

    this.encrypter = x25519Encrypter(this._encryptionKeyPair.publicKey);
    if (!this.encrypter) throw new Error("Encrypter Function Not set");

    this.decrypter = x25519Decrypter(this._seed);
    if (!this.decrypter) throw new Error("Decrypter Function Not set");
  };

  /**
   */
  async encodeDID(publicKey: Uint8Array): Promise<string> {
    const bytes = new Uint8Array(publicKey.length + 2);
    bytes[0] = 0xee;
    bytes[1] = 0x01;
    bytes.set(publicKey, 2);
    return Promise.resolve(`did:key:z${u8a.toString(bytes, "base64")}`);
  }

  /**
   * Start the Central Document Manager
   */
  initDocumentManager = async () => {
    this._documentManager.init();
  };

  /**
   * Stop the Central Document Manager
   */
  stopDocumentManager = async () => {
    if (this._documentManager) {
      this._documentManager.stop();
    }
  };

  /**
   * Get the current Document Manager Instance
   */
  get DocumentManager() {
    return this._documentManager;
  }

  /**
   * Opens the database to load the keys stored in the current system
   */
  initkeys = async () => {
    if (this.defaultOptions.version) {
      console.log(
        chalk.green("[ChokidrService] Starting version"),
        chalk.greenBright(this.version)
      );
    }
    console.log(chalk.green("[ChokidrService] Opening Secure Database"));
    if (!this._db.isOpen()) await this._db.open();
    if (this._db.isOpen()) {
      console.log(chalk.green("[ChokidrService] Database is Open"));
      try {
        const data = await this._db.get(keys["chokidr.seed.init"]);
        if (data) {
          this._seed = Uint8Array.from(data);
          console.log(
            chalk.bgWhite.blue(
              "Data Exists. Running Data Streams",
              keys["chokidr.seed"]
            )
          );
          const peerid = await this._db.get(keys["chokidr.seed.peerid"]);
          const publickey = await this._db.get(keys["chokidr.seed.publickey"]);
          const privatekey = await this._db.get(
            keys["chokidr.seed.privatekey"]
          );
          if (this.envConfig.logging) {
            console.log(chalk.bgWhite.red(`PeerId ${peerid}`));
            console.log(chalk.bgWhite.red(`PublicKey ${peerid}`));
            console.log(chalk.bgWhite.red(`PrivateKey ${peerid}`));
          }
          if (!peerid || !publickey || !privatekey) {
            throw new Error(
              "[ChokidrService] Unable to fetch keys from the system. Please reset or check your configurations"
            );
          }
          this._peerID = await this.generatePeerID({
            id: peerid,
            pubKey: publickey,
            privKey: privatekey,
          });
          console.log(
            chalk.green("[ChokidrService] PeerId:: "),
            await this.peerID.toB58String()
          );
          this._encryptionKeyPair = await this.generateEncryptionKeyPair(
            Uint8Array.from(this._seed)
          );
          this._signatureKeyPair = await this.generateSignatureKeyPair(
            Uint8Array.from(this._seed)
          );
          await this._db.close();
        }
      } catch (error) {
        console.log("[ChokidrService] Default Seed does not exist");
        console.log("[ChokidrService] Generating new seed");
        this._seed = randomBytes(32);
        // convert the seed in hmac hash and then put the value to the database
        console.log(chalk.blue("[ChokidrService] Generating New PeerId"));
        this._peerID = await this.generatePeerID();
        const exportID = await this.peerID.toJSON();
        await this._db
          .batch()
          .put(keys["chokidr.seed.init"], this._seed)
          .put(keys["chokidr.seed.privatekey"], exportID.privKey)
          .put(keys["chokidr.seed.publickey"], exportID.pubKey)
          .put(keys["chokidr.seed.peerid"], exportID.id)
          .write(() => {
            if (this.envConfig.logging)
              console.log(chalk.green("[ChokidrService] Data Written to DB"));
          });

        this._encryptionKeyPair = await this.generateEncryptionKeyPair(
          Uint8Array.from(this._seed)
        );
        this._signatureKeyPair = await this.generateSignatureKeyPair(
          Uint8Array.from(this._seed)
        );
        await this._db.close();
      }
    } else {
      throw new Error("Database not open");
    }
  };
  // TODO: Move this to the auth service
  /**
   * Generate BLS Signature Keypair
   * @param seed
   * @param keypairOptions
   * @returns
   */
  async generateSignatureKeyPair(seed?: Uint8Array, keypairOptions?: any) {
    const bls = new BLS();
    const keypair = await bls.generateBLSDID(seed);
    return Promise.resolve(keypair);
  }

  /**
   * Genere
   * @param seed
   * @param keyPairOptions
   * @returns
   */
  async generateEncryptionKeyPair(seed?: Uint8Array, keyPairOptions?: any) {
    return Promise.resolve(box.sign.keyPair.fromSeed(seed));
  }
  /**
   * Generate peerId for the instance
   * @param peerOpts
   * @returns
   */
  async generatePeerID(peerOpts?: any): Promise<PeerId> {
    if (peerOpts) {
      return Promise.resolve(await PeerId.createFromJSON(peerOpts));
    }
    return Promise.resolve(await PeerId.create({ bits: 4096, keyType: "RSA" }));
  }

  setState = async (state: ckdrEvent) => {
    this.currentState = state;
  };

  getState = () => {
    return this.currentState;
  };
  
  /** Create Signup for the User 
   * @param PhoneNumber 
   * @param Email 
   * @returns
   */
  createSignup = async (
    PhoneNumber:string, 
    Email:string, 
  ):Promise<string> => {
    return new Promise(async(resolve, reject) => {
      try{
        const Block = Object.assign(
          {},
          {
            email:Email,
            phoneNumber:PhoneNumber,
          }

        );
        const jwt = await this.generateJWT(Block);
        console.log(jwt);
        resolve(jwt);

      }catch (error) {
        reject(error);
      }

    });

  };

  private async encodeSignupBlock(
    signup: Signup
  ): Promise<Block<any>> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (!signup) reject("Invitation block not set");
        const cleartext = await prepareCleartext(signup);

        const nonce = randomBytes(box.secretbox.nonceLength);
        const box2 = box.secretbox(cleartext, nonce, this._seed);
        const hash = box.hash(box2);

        const jwe = {
          algo: "xsalsa2poly1305",
          nonce: base64.encode(nonce),
          tag: base64.encode(hash),
          ciphertext: base64.encode(box2),
          recipient: [base64.encode(this._encryptionKeyPair.publicKey)],
        };
        console.log(jwe);
        // const jwe = await createJWE(cleartext, [this.encrypter]);
        const block = await DAG.encode({
          value: jwe,
          codec: dagCbor,
          hasher: sha256,
        });
        resolve(block);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async decodeSignup(block, cid): Promise<Signup> {
    return new Promise<Signup>(async (resolve, reject) => {
      try {
        if (!block) reject("Block Value undefined");
        // @ts-ignore
        const block2 = await DAG.decode({
          bytes: block,
          // @ts-ignore
          codec: dagCbor,
          hasher: sha256,
        });
        console.log(block2.value);
        // if (!block2.cid.equals(cid))
        //   reject(
        //     "[ChokidrService] CID Mistmactch:Unable to verify integirty of the data"
        //   );
        // @ts-ignore
        const nonce = block2.value.nonce;
        //@ts-ignore
        const ciphertext = base64.decode(block2.value.ciphertext);
        const decryptedMessage = box.secretbox.open(
          ciphertext,
          base64.decode(nonce),
          this._seed
        ) as Uint8Array;
        const clearText = decodeCleartext(decryptedMessage);
        console.log("Decoded from DB", clearText);
        resolve(Object.assign(new Signup(), clearText));
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSignup(
    id?: string,
    count?: number
  ): Promise<Signup[] | Signup> {
    return new Promise<Signup[] | Signup>(async (resolve, reject) => {
      if (id) {
        console.log("Finding for ", id);
        const cid = await this._db
          .get(`${keys["chokidr.signup.id"]}${id}`)
          .catch(() => {
            reject("[ChokidrService] Could not find signup for the ID");
          });
        if (!cid)
          reject("[ChokidrService] Unable to fetch cid for the given ID");
        const block = await this._db.get(
          `${keys["chokidr.signup.block"]}${cid}`
        );
        resolve(await this.decodeSignup(block, cid));
      } else if (id==undefined) {
        console.log("Getting Signup");
        let signups: Signup[] = [];

        const dbStream = await this._db.createReadStream({
          lte: `${keys["chokidr.signup.id"]}~`,
          gte: `${keys["chokidr.signup.id"]}`,
          limit: count,
          reverse: false,
        });

        for await (const { key, value } of dbStream) {
          console.log(key, value);
          console.log("Retrived value", key, u8a.toString(value));
          if (!value) reject("Error with the multifetch");
          await this._db
            .get(`${keys["chokidr.signup.block"]}${u8a.toString(value)}`)
            .then((data) => {
              // console.log("Encrypted Block", data);
              if (!data) reject("Unable to fetch block store");
              this.decodeSignup(data, value)
                .then((signup) => {
                  console.log("Signup", signup);
                  signups.push(Object.assign(new Signup(), signup));
                })
                .catch((err) => {
                  console.log(err);
                  reject(err);
                });
            })
            .catch((err) => {
              reject(
                "[ChokidrService] Internal DB Error, Unable to fetch Block for CID"
              );
            });
        }
        console.log('Count -------', signups.length)
        resolve(signups);
      }
      reject('Invalid Call to service')
    });
  }

  async addNewSignupDetails(
    signup: Signup,
    PhoneNumber: string,
    Email: string
  ) {
    const SignupBlock = await this.encodeSignupBlock(signup); 
    console.log(
      `${keys["chokidr.signup.block"]}${SignupBlock.cid.toString()}`,
      SignupBlock.value
    );
    console.log(SignupBlock.cid.toString());
    await this._db
      .batch()
      .put(
        `${keys["chokidr.signup.id"]}${signup.id}`,
        u8a.fromString(SignupBlock.cid.toString())
      )
      .put(
        `${keys["chokidr.signup.block"]}${SignupBlock.cid.toString()}`,
        SignupBlock.bytes
      )
      .put(
        `${keys["chokidr.signup.phonenumber"]}${PhoneNumber}`,
        PhoneNumber
      )
      .put(`${keys["chokidr.signup.email"]}${Email}`, Email)
      .write(() => {
        if (this.envConfig.logging)
          console.log(
            chalk.green("[ChokidrService] Signup details written to the db")
          );
      });
  }
   

  /**
   * Create Invitation for the phoneNumber and email
   * @param phonenumber
   * @param email
   * @returns
   */
  createInvitation = async (
    phonenumber: string,
    email: string
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const block = Object.assign(
          {},
          {
            email: email,
            phoneNumber: phonenumber,
          }
        );
        const jwt = await this.generateJWT(block);
        console.log(jwt);
        resolve(jwt);
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Delete Invitation
   * @param id
   * @returns
   */
  async deleteInvitation(id: string): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      await this._db
        .get(`${keys["chokidr.invitations.id"]}${id}`)
        .catch(async (err) => {
          const result = await this._db.delete(
            `${keys["chokidr.invitations.id"]}${id}`
          );
          resolve(result);
        });
      resolve(false);
    });
  }

  private async generateJWT(block: {
    email: string;
    phoneNumber: string;
  }): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        if (!this.signer) throw new Error("Signer Does not exist");
        const jwt = await createJWT(
          block,
          {
            issuer:
              "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
            signer: this.signer,
          },
          { alg: "EdDSA" }
        );
        resolve(jwt);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async encodeInvitationBlock(
    invitation: Invitation
  ): Promise<Block<any>> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (!invitation) reject("Invitation block not set");
        const cleartext = await prepareCleartext(invitation);

        const nonce = randomBytes(box.secretbox.nonceLength);
        const box2 = box.secretbox(cleartext, nonce, this._seed);
        const hash = box.hash(box2);

        const jwe = {
          algo: "xsalsa2poly1305",
          nonce: base64.encode(nonce),
          tag: base64.encode(hash),
          ciphertext: base64.encode(box2),
          recipient: [base64.encode(this._encryptionKeyPair.publicKey)],
        };
        console.log(jwe);
        // const jwe = await createJWE(cleartext, [this.encrypter]);
        const block = await DAG.encode({
          value: jwe,
          codec: dagCbor,
          hasher: sha256,
        });
        resolve(block);
      } catch (error) {
        reject(error);
      }
    });
  }
  private async decodeInvitation(block, cid): Promise<Invitation> {
    return new Promise<Invitation>(async (resolve, reject) => {
      try {
        if (!block) reject("Block Value undefined");
        // @ts-ignore
        const block2 = await DAG.decode({
          bytes: block,
          // @ts-ignore
          codec: dagCbor,
          hasher: sha256,
        });
        console.log(block2.value);
        // if (!block2.cid.equals(cid))
        //   reject(
        //     "[ChokidrService] CID Mistmactch:Unable to verify integirty of the data"
        //   );
        // @ts-ignore
        const nonce = block2.value.nonce;
        //@ts-ignore
        const ciphertext = base64.decode(block2.value.ciphertext);
        const decryptedMessage = box.secretbox.open(
          ciphertext,
          base64.decode(nonce),
          this._seed
        ) as Uint8Array;
        const clearText = decodeCleartext(decryptedMessage);
        console.log("Decoded from DB", clearText);
        resolve(Object.assign(new Invitation(), clearText));
      } catch (error) {
        reject(error);
      }
    });
  }

  async getInvitation(
    id?: string,
    count?: number
  ): Promise<Invitation[] | Invitation> {
    return new Promise<Invitation[] | Invitation>(async (resolve, reject) => {
      if (id) {
        console.log("Finding for ", id);
        const cid = await this._db
          .get(`${keys["chokidr.invitations.id"]}${id}`)
          .catch(() => {
            reject("[ChokidrService] Could not find invitation for the ID");
          });
        if (!cid)
          reject("[ChokidrService] Unable to fetch cid for the given ID");
        const block = await this._db.get(
          `${keys["chokidr.invitations.block"]}${cid}`
        );
        resolve(await this.decodeInvitation(block, cid));
      } else if (id==undefined) {
        console.log("Getting Inviations");
        let invitations: Invitation[] = [];

        const dbStream = await this._db.createReadStream({
          lte: `${keys["chokidr.invitations.id"]}~`,
          gte: `${keys["chokidr.invitations.id"]}`,
          limit: count,
          reverse: false,
        });

        for await (const { key, value } of dbStream) {
          console.log(key, value);
          console.log("Retrived value", key, u8a.toString(value));
          if (!value) reject("Error with the multifetch");
          await this._db
            .get(`${keys["chokidr.invitations.block"]}${u8a.toString(value)}`)
            .then((data) => {
              // console.log("Encrypted Block", data);
              if (!data) reject("Unable to fetch block store");
              this.decodeInvitation(data, value)
                .then((invitation) => {
                  console.log("Invitation", invitation);
                  invitations.push(invitation);
                })
                .catch((err) => {
                  console.log(err);
                  reject(err);
                });
            })
            .catch((err) => {
              reject(
                "[ChokidrService] Internal DB Error, Unable to fetch Block for CID"
              );
            });
        }
        console.log('Count -------', invitations.length)
        resolve(invitations);
      }
      reject('Invalid Call to service')
    });
  }

  async addNewInvitationDetails(
    invitation: Invitation,
    phonenumber: string,
    email: string
  ) {
    const invitationBlock = await this.encodeInvitationBlock(invitation);
    console.log(
      `${keys["chokidr.invitations.block"]}${invitationBlock.cid.toString()}`,
      invitationBlock.value
    );
    console.log(invitationBlock.cid.toString());
    await this._db
      .batch()
      .put(
        `${keys["chokidr.invitations.id"]}${invitation.id}`,
        u8a.fromString(invitationBlock.cid.toString())
      )
      .put(
        `${keys["chokidr.invitations.block"]}${invitationBlock.cid.toString()}`,
        invitationBlock.bytes
      )
      .put(
        `${keys["chokidr.invitations.phonenumber"]}${phonenumber}`,
        phonenumber
      )
      .put(`${keys["chokidr.invitations.email"]}${email}`, email)
      .write(() => {
        if (this.envConfig.logging)
          console.log(
            chalk.green("[ChokidrService] Invitation details written to the db")
          );
      });
  }

  async verifyIfExists(email?: string, phonenumber?: string) {
    let emailE = true;
    let numberE = true;
    if (email) {
      await this._db
        .get(`${keys["chokidr.invitations.email"]}${email}`)
        .catch((err) => {
          emailE = false;
        });
    }
    if (phonenumber) {
      await this._db
        .get(`${keys["chokidr.invitations.phonenumber"]}${phonenumber}`)
        .catch(async (err) => {
          numberE = false;
        });
    }
    if (emailE && numberE) return true;
    return false;
  }

}