import { injectAll, InjectionToken, singleton } from "tsyringe";
import EnvConfig from "../config";
import {
  createFactory,
  Factory,
  ControllerOptions,
  ControllerOptionsOverrides,
} from "ipfsd-ctl";
import { IPFS } from "ipfs-core";
import PeerId from "peer-id";
import chalk from "chalk";
import * as dagJose from "dag-jose";
import { convert as toLegacyIpld } from "blockcodec-to-ipld-format";
import Libp2pFactory from "./Libp2pFactory";
import ipfs from "ipfs";
import ipfsHttpClient from "ipfs-http-client";
const dagJoseIpldFormat = toLegacyIpld(dagJose);
import Libp2p from "libp2p";

const path = "/tmp/ckdr/.ipfs";

export const ipfsAppDIToken: InjectionToken<IPFS> = "IpfsDeamon";

@singleton()
export default class IPFSFactory {
  private factory: Factory;
  private _ipfs;
  private libp2p: Libp2p;
  private peerId: PeerId;
  private enableLibp2p: boolean = false;

  constructor(
    private readonly envConfig: EnvConfig,
    private readonly libp2pFactory: Libp2pFactory
  ) {
    this.enableLibp2p = envConfig.database?.ipfs.usep2p || false;
  }

  get ipfs(){
    if(!this._ipfs) throw new Error("[IPFSFactory] Factory Not initilaized")
    return this._ipfs
  }

  async bootstrap(peerId?: PeerId): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (this.enableLibp2p) {
          if (!this.libp2pFactory)
            throw new Error("Libip2p Instance unavailable");
            console.log('[CHOKIDRSERVICE] Creating Libp2p Instance ...');
          this.libp2p = await this.libp2pFactory.create(peerId);
          resolve();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async create(peerId?: PeerId): Promise<void> {
    if (!peerId) console.log("[IPFSFactory] Starting with default PeerID instance");
    if (this.factory)
      throw new Error("[IPFSFactory] Factory Instance Already Existing. Aborting Code");
    console.log(chalk.white("[IPFSFactory] Starting Factory Controller"));
    if (this.enableLibp2p) {
      if (!this.libp2p) {
        throw new Error(
          "[IPFSFactory] Libp2p instance is not available, please instanciate Libp2p instance"
        );
      }
      console.log('[IPFSFactory] Starting IPFS Factory')
      this.factory = createFactory({
        type: "js",
        test: false,
        ipfsHttpModule: ipfsHttpClient,
        ipfsModule: ipfs,
        ipfsBin: require.resolve("ipfs/src/cli.js"),
        ipfsOptions: {
          //@ts-ignore
          libp2p: await this.libp2p,
          repo: path,
          ipld: { formats: [dagJoseIpldFormat] },
        },
      });
      return Promise.resolve();
    }
    this.factory = createFactory({
      type: "js",
      test: false,
      ipfsHttpModule: ipfsHttpClient,
      ipfsModule: ipfs,
      ipfsBin: require.resolve("ipfs/src/cli.js"),
      ipfsOptions: {
        repo: path,
        ipld: { formats: [dagJoseIpldFormat] },
      },
    });
    return Promise.resolve();
  }

  async start(): Promise<IPFS> {
    return new Promise<IPFS>(async (resolve, reject) => {
      try {
        if (!this.factory)
          throw new Error(
            "[IPFSFactory] Factory Instance not started. Plese start factory instance and start the process. Aborting Process"
          );
        console.log('[IPFSFactory] Starting IPFS Deamon')
        const node = await this.factory.spawn({ type: "js" });
        await node.start();
        console.log(await node.api.id())
        this._ipfs = node.api;
        resolve(this._ipfs);
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
          console.log('Stopping IPFS Instance');
        if(this._ipfs)
        // await this.ipfs.stop();
        console.log('Stopping IPFS factory. Cleaning up system')
        if(this.factory)
        await this.factory.clean();
        resolve();
      } catch (error) {
        console.log(error)
      }
    });
  }
}
