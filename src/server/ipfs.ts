import {
  createFactory,
  ControllerOptions,
  ControllerOptionsOverrides,
} from "ipfsd-ctl";
import PeerId from "peer-id";
import chalk from "chalk";
import * as dagJose from "dag-jose";
import { convert as toLegacyIpld } from "blockcodec-to-ipld-format";

import { getLibp2p, createLibp2p } from "../transporters/libp2p";
import { loadConfig } from "../config";

const config = loadConfig();
const logging = config.logging;
const dagJoseIpldFormat = toLegacyIpld(dagJose);

// TODO : Move to Config Path 
const path = "/tmp/ckdr/.ipfs";

/**
 * 
 * @param peerId PeerID to Start the instance From
 * @returns 
 */
export async function server(peerId?: PeerId, port:number=5001) {
  try {
    if(!peerId) throw new Error('PeerID not defined')
    console.log(chalk.green('Starting Factory Controller'));
    const factory = createFactory({
      type:'js',
      test:false,
      ipfsHttpModule:require('ipfs-http-client'),
      ipfsModule:require('ipfs'),
      ipfsBin:require.resolve('ipfs/src/cli.js'),
      ipfsOptions:{
        // @ts-ignore
        libp2p: createLibp2p,
        repo: path,
        ipld: { formats: [dagJoseIpldFormat] },
      }
    })
    console.log(chalk.green('Spawnning Node Instance'))
    const node = await factory.spawn({type:'js'});
    await node.start();
    console.log(await node.api.id())
    console.log(chalk.green("[CKDR] Connecting Libp2p ..."));
    // const libp2pNode = await getLibp2p();
    console.log(chalk.green("[CKDR] Libp2p Connected"));
    if (logging) {
      // libp2pNode.connectionManager.on("peer:connect", (con) => {
      //   console.log(
      //     chalk.green("[Libp2p]"),
      //     chalk.yellow(`🚀  Connected to ${con.remotePeer.toB58String()}`)
      //   );
      // });
      setInterval(async () => {
        console.log(chalk.green(`IPFS BITSWAP`), await node.api.stats.bitswap());
        console.log(chalk.green(`IPFS RepoStatus`), await node.api.stats.repo());
        // for await (const stats of node.api.stats.bw()) {
        //   console.log(chalk.green(`[IPFS BWStatus]`), stats);
        // }
      }, 10000);
    }
    process.on('SIGINT',async()=>{
      await node.stop();
      await factory.clean();
    })
    process.stdin.on("data", (message) => {
      console.log(message);
    });
    return node
  } catch (error) {
    throw error;
  }
}


// server().catch(error=>{
//   console.log(error)
//   process.exit(1);
// })