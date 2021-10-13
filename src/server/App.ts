/**
 * Happymonk Technology Pvt Ltd.
 *
 *
 *
 *
 *
 */
import { singleton, DependencyContainer } from "tsyringe";
import chalk from "chalk";
import Server from "./server";
import MQTT, { startMqtt } from "../transporters/mqtt";
import { server as IpfsServer } from "./ipfs";
import { docker } from "./docker";
import EnvConfig from "../config";
import ChokidrService from "./ChokidrService";
import DBFactory from "../bootstrap/DbFactory";
import IpfsFactory from "../bootstrap/IpfsFactory";
import RedisFactory from "../bootstrap/RedisFactory";

/**
 * Default Class App to start the application
 */
@singleton()
export class App {
  private db;
  private ipfs;
  private kafka;
  private mqtt:MQTT;
  private ckdrConfig;

  constructor(
    private readonly server: Server,
    private readonly chokidrService: ChokidrService,
    private readonly dbFactory: DBFactory,
    private readonly ipfsFactory: IpfsFactory,
    private readonly redisFactory:RedisFactory,
    private readonly config: EnvConfig,
  ) {}

  async bootstrap(): Promise<void> {
    console.log("[ChokidrService] Connecting to Local Database Instance");
    if (this.db) throw new Error("[App] Database Instance Already Instaniated");
    this.db = await this.dbFactory.create();
    if (!this.db)
      throw new Error("[App] Database Object not injected. Please check ");
    if (!this.server)
      throw new Error("[App] Server Function not Injected. Please check");
    console.log("[App] Bootstrapping Chokidr Service");
    await this.chokidrService.bootstrap();
    const peerId = this.chokidrService.peerID
    console.log(`[App] PeerId::: ${peerId}`)
    console.log("[App] Bootstrapping IPFS ...");
    await this.ipfsFactory.bootstrap(peerId);
    console.log("[App] Creating IPFS Deamon Factory ...");
    await this.ipfsFactory.create();
    console.log("[App] Creating RediFactory");
    // await this.redisFactory.bootstrap();
    console.log("[App] Bootstrapping Server");
    await this.server.bootstrap();
    console.log("[App] Bootstrapping Complete");
    return;
  }

  async start(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log("[App] Opening Database");
        await this.dbFactory.start();
        console.log("[App] Starting IPFS ...");
        await this.ipfsFactory.start();
        console.log("[App] Registering Chokidr Service ...");
        await this.chokidrService.start();
        console.log("[App] Starting Server Instance");
        await this.server.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    await new Promise(async (resolve) => {
      console.log("[App] Stoping server instance... ");
      await this.server.stop();
      console.log("[App] Stoping ipfs instance... ");
      await this.ipfsFactory.stop();
      console.log("[App] Stoping db instance... ");
      await this.dbFactory.stop();
      resolve;
    });

  }

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
  
}
