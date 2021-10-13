import { ckdrOptions } from "./server/ChokidrService";
import { DateTime } from "luxon";
import type { IOptions } from "etcd3";

import { singleton } from "tsyringe";

// Call the dotenv load the .env files from the server
require("dotenv").config();
type config = {
  port: number | string;
  url: string;
  logging: boolean;
  ckdr: ckdrOptions;
  domain: string;
  database?: {
    inmemory: {
      uri?: string;
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
      name: string;
      cachingtime?: string;
      hydrate?: boolean;
      rocksdb?: {
        createIfMissing: boolean;
        valueEncoding: string;
        keyEncoding: string;
      };
    };
    etcd: {
      url: string;
      port: string[];
      isMaster: boolean | string;
      options?: IOptions;
    };
    ipfs?: {
      peerID: string | undefined;
      swarmurl?: {};
      test?: boolean;
      remote?: boolean;
      endpoint?: string;
      disposable?: boolean;
      type?: string;
      env?: Object;
      ipfsOptions?: any;
      logging: boolean;
    };
  };
  transporters?: {
    mqtt: {
      url: string;
      port: string | number;
    };
    kafka: {
      url: string;
      port: string[];
      config: any;
      globalProducerConfig: any;
      globalConsumerConfig: any;
    };
    nats?: {
      url: string;
      port: string;
    };
    libp2p: any;
    socketio?: ISocketIOOptions;
  };
};

export interface ISocketIOOptions {
  path?: string;
  serveClient?: boolean;
  pingInterval?: number;
  pingTimeout?: number;
  cookie?: boolean;
  cors?: string[];
}

// Depricate this 
export function loadConfig(): config {
  return {
    port: process.env.PORT || 4000,
    url: process.env.url || "http://localhost",
    domain: "http://www.chokidr.com",
    logging: true,
    ckdr: {
      mode: process.env.MODE || "single",
      enablecli: process.env.ENABLECLI || false,
      version: process.env.VERSION || "0.0.1",
      name: `ckdr-test` || process.env.NAME,
      enablefrontend: false || process.env.FRONTEND,
      mediaserver: {
        enableauthentication: process.env.MEDIASERVERENABLE || true,
        rtmp: process.env.RMTPENABLE || true,
        rtsp: process.env.RTSPENABLE || false,
        publickey: "",
        privatekey: "",
      },
      httpsenabled: process.env.HTTPSENABLE || false,
      publickey: "",
      privatekey: "",
    },
    transporters: {
      mqtt: {
        url: process.env.BROKERURL || "http://localhost",
        port: process.env.MQTTPORT || 3000,
      },
      kafka: {
        url: process.env.KAFKAURL || "http://localhost",
        port: [process.env.KAFKAURL || "8083"],
        config: {
          "client.id": "ckdrKafka",
          "metadata.broker.list": `http://164.52.208.218:9092`,
        },
        globalProducerConfig: {
          "client.id": "ckdrKafka",
          "metadata.broker.list": `http://164.52.208.218:9092`,
          "compression.codec": "gzip",
          "retry.backoff.ms": 200,
          "message.send.max.retries": 10,
          "socket.keepalive.enable": true,
          "queue.buffering.max.messages": 10000,
          "queue.buffering.max.ms": 1000,
        },
        globalConsumerConfig: {
          "client.id": "ckdrKafka",
          "metadata.broker.list": `http://164.52.208.218:9092`,
        },
      },
      libp2p: {},
      socketio: {
        // path: "/test",
        serveClient: false,
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false,
        cors: [],
      },
    },
    database: {
      inmemory: {
        name: process.env.SYSTEMNAME || `ckdr`,
        rocksdb: {
          createIfMissing: true,
          valueEncoding: "binary",
          keyEncoding: "string",
        },
      },
      ipfs: {
        peerID: process.env.peerID || undefined,
        swarmurl: {} || process.env.SWARMURL,
        logging: true,
      },
      etcd: {
        url: process.env.URL || "http://164.52.208.218",
        port: [process.env.ETCDPORT || "2379", "2380"],
        isMaster: process.env.MASTER || true,
        options: {
          hosts: process.env.ETCDURL || [
            "http://164.52.208.218:2379",
            "http://164.52.208.218:2380",
          ],
        },
      },
    },
  };
}
@singleton()
export default class EnvConfig {
  readonly port: number | string;
  readonly url: string;
  readonly logging: boolean;
  readonly ckdr: ckdrOptions;
  readonly domain: string;
  readonly apiKey:string;
  readonly database?: {
    readonly inmemory: {
      uri?: string;
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
      name: string;
      cachingtime?: string;
      hydrate?: boolean;
      rocksdb?: {
        createIfMissing: boolean;
        valueEncoding: string;
        keyEncoding: string;
      };
    };
    etcd: {
      url: string;
      port: string[];
      isMaster: boolean | string;
      options?: IOptions;
    };
    ipfs?: {
      usep2p:boolean
      peerID: string | undefined;
      swarmurl?: {};
      test?: boolean;
      remote?: boolean;
      endpoint?: string;
      disposable?: boolean;
      type?: string;
      env?: Object;
      ipfsOptions?: any;
      logging: boolean;
    };
  };
  transporters?: {
    mqtt: {
      url: string;
      port: string | number;
    };
    kafka: {
      url: string;
      port: string[];
      config: any;
      globalProducerConfig: any;
      globalConsumerConfig: any;
    };
    nats?: {
      url: string;
      port: string;
    };
    libp2p: any;
    socketio?: ISocketIOOptions;
  };
  constructor() {
    this.port= process.env.PORT || 4000,
    this.url =  process.env.url || "http://localhost"
    this.domain = "http://www.chokidr.com" || process.env.DOMAIN
    this.apiKey = "X-CHOKIDR-Key"
    this.logging = true
    this.ckdr = {
      mode: process.env.MODE || "single",
      enablecli: process.env.ENABLECLI || false,
      version: process.env.VERSION || "0.0.1",
      name: `ckdr-test` || process.env.NAME,
      enablefrontend: false || process.env.FRONTEND,
      mediaserver: {
        enableauthentication: process.env.MEDIASERVERENABLE || true,
        rtmp: process.env.RMTPENABLE || true,
        rtsp: process.env.RTSPENABLE || false,
        publickey: "",
        privatekey: "",
      },
      httpsenabled: process.env.HTTPSENABLE || false,
      publickey: "",
      privatekey: "",
    }
    this.transporters = {
      mqtt: {
        url: process.env.BROKERURL || "http://localhost",
        port: process.env.MQTTPORT || 3000,
      },
      kafka: {
        url: process.env.KAFKAURL || "http://localhost",
        port: [process.env.KAFKAURL || "8083"],
        config: {
          "client.id": "ckdrKafka",
          "metadata.broker.list": `http://164.52.208.218:9092`,
        },
        globalProducerConfig: {
          "client.id": "ckdrKafka",
          "metadata.broker.list": `http://164.52.208.218:9092`,
          "compression.codec": "gzip",
          "retry.backoff.ms": 200,
          "message.send.max.retries": 10,
          "socket.keepalive.enable": true,
          "queue.buffering.max.messages": 10000,
          "queue.buffering.max.ms": 1000,
        },
        globalConsumerConfig: {
          "client.id": "ckdrKafka",
          "metadata.broker.list": `http://164.52.208.218:9092`,
        },
      },
      libp2p: {},
      socketio: {
        // path: "/test",
        serveClient: false,
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false,
        cors: [],
      },
    }
    this.database =  {
      inmemory: {
        name: process.env.SYSTEMNAME || `ckdr`,
        rocksdb: {
          createIfMissing: true,
          valueEncoding: "binary",
          keyEncoding: "string",
        },
      },
      ipfs: {
        usep2p:true,
        peerID: process.env.peerID || undefined,
        swarmurl: {} || process.env.SWARMURL,
        logging: true,
      },
      etcd: {
        url: process.env.URL || "http://164.52.208.218",
        port: [process.env.ETCDPORT || "2379", "2380"],
        isMaster: process.env.MASTER || true,
        options: {
          hosts: process.env.ETCDURL || [
            "http://164.52.208.218:2379",
            "http://164.52.208.218:2380",
          ],
        },
      },
    }
  }
}
