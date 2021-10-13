import Libp2p from "libp2p";
import Bootstrap from "libp2p-bootstrap";
import wrtc from "wrtc";
import WebRTCStar from "libp2p-webrtc-star";
import Websockets from "libp2p-websockets";
import filters from "libp2p-websockets/src/filters";
import KadDHT from "libp2p-kad-dht";
import Mplex from "libp2p-mplex";
import TCP from "libp2p-tcp";
import { NOISE } from "@chainsafe/libp2p-noise";
import MulticastDNS from "libp2p-mdns";
import Gossipsub from "libp2p-gossipsub";
import PeerId from "peer-id";
import type { Config as IPFSConfig } from "ipfs-core-types/src/config";
import {
  resolveLater
} from "../utils/index";
import { loadConfig } from "../config";

/**
 * TODO: Refactor Libp2p code out of Resolve later Function
 */

const config = loadConfig();
const [libp2pPromise, resolveLibp2p] = resolveLater<Libp2p>();

/**
 * Get Current instanace of libp2p from the system
 * @returns
 */
export async function getLibp2p() {
  return libp2pPromise;
}

export const createLibp2p = ({peerId, config }: { peerId:PeerId, config: IPFSConfig }) => {
    resolveLibp2p(
      Libp2p.create({
        peerId,
        addresses: {
          listen: [
            // '/dns4/wrtc-star1.par.ckdr.pub/tcp/443/wss/p2p-webrtc-star',
            // '/dns4/wrtc-star2.sjc.cldr.pub/tcp/443/wss/p2p-webrtc-star',
            "/ip4/127.0.0.1/tcp/0",
            "/ip4/0.0.0.0/tcp/0/ws",
            `/ip4/127.0.0.1/tcp/7000/ws/p2p-webrtc-star/`,
            // `/ip4/168.52.71.218/tcp/9090/ws/p2p-webrtc-star/`,
            // '/dns4/server.ckdr.ml/tcp/9090/ws/p2p-webrtc-star/',
            // '/dns4/server.ckdr.ml/tcp/443/wss/p2p-webrtc-star/',
          ],
        },
        modules: {
          transport: [Websockets, TCP],
          streamMuxer: [Mplex],
          connEncryption: [NOISE],
          peerDiscovery: [MulticastDNS, Bootstrap],
          pubsub: Gossipsub,
          dht: KadDHT,
        },
        config: {
          transport: {
            [Websockets.prototype[Symbol.toStringTag]]: {
              filter: filters.all,
            },
          },
          peerDiscovery: {
            autodial: false,
            [Bootstrap.tag]: {
              enabled: true,
              list: config.Bootstrap,
            },
          },
          relay: {
            enabled: true,
            hop: {
              enabled: true,
              active: true,
            },
          },
          dht: {
            enabled: true,
            kBucketSize: 20,
            randomWalk: {
              enabled: true,
              interval: 20e3, // This is set low intentionally, so more peers are discovered quickly. Higher intervals are recommended
              timeout: 2e3, // End the query quickly since we're running so frequently
            },
          },
          pubsub: {
            enabled: true,
          },
        },
        metrics: {
          enabled: true,
          computeThrottleMaxQueueSize: 1000, // How many messages a stat will queue before processing
          computeThrottleTimeout: 2000, // Time in milliseconds a stat will wait, after the last item was added, before processing
          movingAverageIntervals: [
            // The moving averages that will be computed
            60 * 1000, // 1 minute
            5 * 60 * 1000, // 5 minutes
            15 * 60 * 1000, // 15 minutes
          ],
          maxOldPeersRetention: 50, // How many disconnected peers we will retain stats for
        },
      })
    );
    return libp2pPromise;
  };