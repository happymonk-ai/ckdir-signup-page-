/**
 * Happymonk Technology Pvt Ltd.
 *
 *
 * 
 *
 *
 */
import * as avvio from "avvio";
import chalk from "chalk";
import { start as startFastifyInstance } from "./server";
import MQTT, { startMqtt } from "../transporters/mqtt";
import { server as IpfsServer } from "./ipfs";
import { docker } from "./docker";
import { Etcd, startEtcd } from "../database/etcd";
import Kafka, { startKafka } from "../transporters/kafka";
import { loadConfig } from "../config";
import ChokidrService from "./ChokidrService";
import {createDIContainer} from "./dependencyContainers";
import DB from "../database/db";

export const config = loadConfig();

import { singleton } from "tsyringe";

export async function start() {
  let mqtt: MQTT;
  let kafka: Kafka;
  let etcd: Etcd;
  let db: DB;
  const chokidr = new ChokidrService();
  await chokidr.initkeys();
  async function main() { 
  }
}

@singleton()
export class App {
  private app
  constructor(
    private readonly chokidrService: ChokidrService,
    private readonly mqtt: MQTT,
    private readonly kafka: Kafka,
    private readonly etcd: Etcd,
    private readonly db: DB
  ) {}
  async bootstrap(): Promise<void> {
    try {
      const app = avvio.default();
      app.on("preReady", () => {
        console.log(chalk.bgWhite.red("Booting Sequence"));
        console.log(app.prettyPrint());
      });
      await app
        .use(this.initCKDR, config.ckdr) // done
        .after(this.startIpfs) // done
        .after(this.startInMemoryDB)
        .after(this.connectDatabase)
        .after(this.connectETCD)
        .after(this.initDocumentManager)
        .after(this.connectTransporters)
        .after(this.startFasitfyServer)
        // .after(startChokidrHeartBeat)
        .onClose(this.systemOnClose);
    } catch (error) {
      throw error;
    }
  }

  async start():Promise<void>{

  }

  async stop():Promise<void>{

  }
  /**
   * Function To handle when the application is shutting down
   */
   systemOnClose = async () => {
    console.log(chalk.red("Shutting Down Application"));
    await this.mqtt.close();
    // await Ckdr.stop();
  };

  /**
   *
   */
  initDocumentManager = async () => {
    console.log(chalk.green("[CKDR]"), chalk.blue("Document Manager starting"));
    this.chokidrService.initDocumentManager();
  };

  /**
   * Round Robin Fashion To check all the components in the system and update the chokidr document
   * Produces to ckdr::heartbeat:: key::nanoid value:yes/no
   * Consumer to ckdr::heartbeat::
   */
  startChokidrHeartBeat = async () => {
    // Start Heartbeat Function of the system.
    setInterval(() => {
      console.log(chalk.green("[CKDR]"), chalk.white("Sending HeartBeats"));
      setTimeout(() => {
        console.log(chalk.green("[CKDR]"), chalk.red(`Processing Information`));
        // update ckdr document over here with the systemtime stamp and information
      }, 1000);
      console.log(chalk.blue("System Status"), chalk.greenBright("OK"));
    }, 3000);
  };

  /**
   * Start Fastify server instance
   */
  startFasitfyServer = async () => {
    // TODO : Update Based on Cluster Worker to on
    await startFastifyInstance();
  };

  /**
   * Get and Start the IPFS Demon with Libp2p Connection
   */
  startIpfs = async () => {
    console.log(chalk.green("[CKDR]"), chalk.green("Starting IPFS Instance"));
    if (!this.chokidrService?.peerID)
      throw new Error(
        "CHOKIDR: Instance Peer ID not set. Please Generate a peerID, before Proceeding"
      );
    await IpfsServer(this.chokidrService.peerID).catch((err) => {
      throw err;
    });
  }
  // start the chokidr node
  initCKDR = async () => {
    console.log(chalk.green("[CKDR] Initializing Keys"));
    if (config.ckdr) {
      console.log(chalk.green("[CKDR] Configurations Loading..."), config.ckdr);
    }
    // call the ckdr init block over here
    await this.chokidrService.initkeys().catch((err) => {
      console.log("[ERROR] caught in intialization");
      console.error(err);
      throw err;
    });
    if (config.logging) {
      console.log(chalk.green("PeerID Set ::: "), this.chokidrService.peerID);
      console.log(
        chalk.green("Encryption keypair ::: ")
        // chokidr.encryptionKeyPair
      );
      console.log(
        chalk.green("SignatureKeypair ::: ")
        // chokidr.signatureKeypair
      );
    }
    console.log("[CKDR] Keys Init done...");
  }

  // check if the database exisits as a containers in the system
  connectDatabase = async () => {
    console.log(chalk`Connecting to databases`);
    console.log(chalk`Database Connected`);
    const containers = await docker.listContainers();
    // check for the container and network in the system
    if (!containers) console.log(chalk.red("No container found"));
    else console.log(chalk.green(containers));
  }

  /**
   * Start the InMemoryDatabase in the system with Sublevel Interface
   */
  async startInMemoryDB() {
    console.log(chalk`[CKDR] Database Initializing`);
    await this.db.init().catch((error) => {
      console.log("Error in intializing rocksdb");
      console.error(error);
      throw error;
    });
  }

  /**
   * ETCD Database Starter Function.
   * If Config is set to the master election campaign will run
   * If Config is set to slave the database will run observer for changes on the master node
   *
   */
  async  connectETCD() {
    console.log(chalk`Connecting to ETCD`);
    console.log(chalk`Starting Elections`);

    const edb = await this.etcd.instantiateDb();
    if (config.database.etcd.isMaster) {
      console.log(chalk.green("[CKDR] Configuration set to Master"));
      if (this.etcd) {
        console.log(chalk.green("[CKDR] Running Election with peers"));
        await this.etcd.runCampaign();
      }
    } else {
      console.log(chalk.green("[CKDR] Oberserving Leader"));
      // TODO : Create Slave Configuration
      if (this.etcd) {
        console.log(chalk.green("[CKDR] Running Election with peers"));
        await this.etcd.observeLeader();
      }
    }
  }

  async  connectTransporters() {
    console.log(chalk`Bootstrapping Transporters.`);
    console.log(chalk`Bootstrapping MQTT`);
    // this.mqtt = await startMqtt();
    console.log(chalk`Connecting MQTT`);
    await this.mqtt.connect();
    console.log(chalk`Connecting Kafka`);
    // this.kafka = await startKafka();
    const admin = this.kafka.admin;
    console.log("Connecting to Admin", admin.logger());
    await admin.connect();
    console.log("Listing Available Topics");
    await admin.listTopics().then((response) => console.log(response));
  }

}
