import chalk from 'chalk';
import EventEmitter from "eventemitter3";
import { Consumer, Producer, ProducerRecord } from "kafkajs";
import { DateTime } from "luxon";
import { MqttClient } from "mqtt";
import { getKafka } from "./kafka"
import { getMqtt } from './mqtt'
import { resolveLater } from '../utils/index';
import { setTimeout } from 'node:timers/promises';


const WILDCARD = "*"
const TOPIC_PATTERN = new RegExp("/", "g");

const [bridgePromise, resolveBridge] = resolveLater<Bridge>()


export type IBridgeConfiguarations = {
    routing: {}
    subscribeEtl?: (topic, message, packet, cb) => void
    produceEtl?: (topic, message, packet, cb) => void
    debug?: boolean
}

const BridgeConfigurations: IBridgeConfiguarations = {
    routing: {
        //"*": "*", // from all to all (indiviudally 1:1)
        //"*": "kafka-test", // from all to single kafka-test topic
        //"mqtt-topic": "kafka-topic", // from mqtt-topic to kafka-topic only
        "*": "ipcamera-3"
    },
    subscribeEtl: (topic, message, packet, callback) => {
        // first param is an error, if you pass one, we will omit the message
        callback(null, {
            topic,
            message,
        });
    }, 
    produceEtl: (topic, message, key, callback) => {
        // first param is an error, if you pass one, we will omit the message
        callback(null, {
            topic,
            message, // you can pass an object, will be turned into a string
            key, // default uuid.v4
            partition: null, // default null
        });
    },
}


type BridgeStatus = 'starting' | 'running' | 'processing' | 'waiting'

class Bridge extends EventEmitter {

    mqtt: MqttClient;
    producer: Producer
    config
    topicDelimiter = ":"
    routedMessages: number = 0
    skippedMessages: number = 0
    errors: number = 0
    startTime: string
    routes
    status: BridgeStatus

    constructor(opts?: IBridgeConfiguarations) {
        super();
        this.config = opts
        this.routes = opts.routing
        this.on('error', (error: any) => {
            this.errors++
        })

    }

    async connect() {
        this.startTime = DateTime.now().toISOTime();
        this.mqtt = await (await getMqtt()).client;
        this.producer = await (await getKafka()).producer;
        this.mqtt.on('error', (error: any) => {
            this.emit('error', error);
        });
        this.mqtt.emit('startOnBridge')
        this.mqtt.on('message', (topic, message) => {
            console.log('[MQTT]', topic, message, DateTime.now());
            this.process(topic, message);
        })
    }

    async reconnect(){
        
    }

    async connectKafka() {
        this.producer = await (await getKafka()).producer;
    }


    process(topic, message) {
        console.log(chalk.greenBright('M2K Data Process',topic));
        let target  = this.routes[topic]
        if(!target){
            target = this.routes[WILDCARD];
        }
        if(!target){
            this.skippedMessages++;
            return;
        }
        if(!this.producer){
            console.log(chalk.redBright('Producer Not Active'))
            
            this.skippedMessages++
            return;
        }
        if(target==WILDCARD){
            return this.producer?.send({topic:'default', messages:message})
        }
        return this.producer?.send({topic:topic,messages:message})
    }

    close() {
        console.log(chalk.red('[MQTT2KAFKA bridge disconnecting]'))
        this.mqtt.end();
        this.producer.disconnect();
    }
}


export async function startBridge() {
    const bridge = new Bridge(BridgeConfigurations);
    await bridge.connect().then(() => {
        console.log('[BRIDGE] Connected')
    });
    resolveBridge(bridge);
}

export const getBridge = async () => {
    return bridgePromise;
}


startBridge();