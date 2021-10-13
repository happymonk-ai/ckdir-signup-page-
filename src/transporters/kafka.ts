/**
 * Happymonk Technology Pvt Ltd
 * 
 * Kafka Implementation using Event Emitter
 * 
 */

import chalk from 'chalk';
import fs from 'fs'
import { Kafka as _Kafka, Producer, Consumer, Admin, KafkaConfig, ITopicMetadata, BrokersFunction, ProducerConfig, ConsumerConfig } from 'kafkajs'
import EventEmitter from 'eventemitter3';
import fetch from 'node-fetch';
import {singleton} from 'tsyringe'
import { ITopicConfig } from '../interface/ITopicConfig';

@singleton()
export default class Kafka extends EventEmitter {
    private host;
    clientId: string = 'kafka1';
    brokers: string[] | BrokersFunction;
    admin: Admin;
    producer: Producer;
    consumer: Consumer;
    topics: string[];
    kafka: _Kafka;
    discoverBroker = false;
    elt = null


    producerList: Map<string,Producer> 
    consumerList:Map<string,Consumer>

    constructor(opts?: KafkaConfig) {
        super();
        this.brokers = opts.brokers
        this.producerList =  new Map<string,Producer>();
        this.consumerList = new Map<string,Consumer>();
        this.kafka = new _Kafka({
            brokers: this.brokers,
            clientId: this.clientId,
            retry: {

            }
            // ssl:{
            // 	serverLocation: '0.0.0.0',
            // 	rejectUnauthorized:false,
            // 	ca:[fs.readFileSync('','utf-8')],
            // },
            // sasl:{
            // 	mechanism:'plain',
            // 	username:'test',
            // 	password:'test',
            // },
        });
        this.admin = this.kafka.admin();
    }



    async getProducer(name:string, opts?: ProducerConfig) {
        return new Promise<Producer>(async (resolve, reject) => {
            try {
                if (!this.producer) this.producer = this.kafka.producer(opts);
                await this.producer.connect();
                resolve(this.producer)
            } catch (error) {
                reject(error)
            }
        })
    }


    async connectConsumer(opts?: ConsumerConfig) {
        return new Promise(async (resolve, reject) => {
            try {
                const consumer = await this.kafka.consumer(opts)
                await consumer.connect();
                resolve(consumer);
            } catch (error) {
                reject(error);
            }
        })

    }

    async disconnectProducer() {
        if (!this.producer) throw new Error('Producer not connected');
        await this.producer.disconnect();
    }

    async disconnectConsumer() {
        if (this.consumer) throw new Error('Consumer not connected');
        await this.consumer.disconnect();
    }


    async addTopic(topic: string, partitions: number = 1) {
        let { topics, admin } = this;
        const iTopic: ITopicConfig[] = [];
        iTopic.push(Object.assign({}, { topic: topic, numPartitions: 3 }));
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`[KAFKA]: Admin Connecting ...`);
                await admin.connect();
                console.log(`[KAFKA]: ... Admin Connected`);
                console.log(`[KAFKA]: Creating Topic`);
                await admin.createTopics({ topics: iTopic });
                console.log(`[KAFKA]: Created Topic with Parition Count Connected ...`);
                resolve(topics);
            } catch (error) {
                reject(error);
            }
        })
    }


    async subscribe(topic){
        return new Promise(async (resolve, reject) => {
            const sub = await this.consumer.subscribe({topic:topic});
            resolve(sub)
        })
    }

    async close() {
        console.log(`[KAFKA]:Disconnecting Admin`)
        this.admin.disconnect();
        console.log(`[KAFKA]:Disconnecting Producer`)
        this.producer.disconnect();
        console.log(`[KAFKA]:Disconnecting Consumer`)
        this.consumer.disconnect();
    }
}


const brokers = (host: string, ports: string[]): string[] => [`${host}:9092`, `${host}:9093`, `${host}:9094`];



const getBrokers = (host?: string, ports?: string[], discovery: boolean = false): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            if (discovery) {
                const brokers = await discoverBrokers(host)
                resolve(brokers)
            } else {
                resolve(brokers(host, ports));
            }
        } catch (error) {
            reject(error)
        }
    })
}

async function discoverBrokers(seedUrl?: string): Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
        try {
            const clusterResponse = await fetch('https://chokidr.ml:9092/v3/clusters', { headers: { 'Accept': 'application/vnd.api+json' } }).then(response => response.json());
            const clusterUrl = clusterResponse?.data[0].links.self
            const brokerResponse = await fetch(`${clusterUrl}/brokers`, { headers: { 'Accept': 'application/vnd.api+json' } }).then(response => response.json());
            const brokers = brokerResponse?.data.map(broker => {
                const { host, port } = broker.attributes.host;
                const brokers = [];
                brokers.push(`${host}:${port}`)
                resolve(brokers);
            })
        } catch (error) {
            reject(error);
        }
    });
}



let kafka

export const getKafka = async (opts?: KafkaConfig) => {
    if(!kafka)
    return Promise.resolve(kafka);
    else
    return Promise.reject(new Error('Kafka Not Initiazled'))
}

export const startKafka = async (opts?: KafkaConfig) => {
    const host = '164.52.208.218';
    const brokers = [`${host}:9092`, `${host}:9093`, `${host}:9094`];
    console.log(`[KAFKA] Attempting to connect to Broker ${brokers}`);
    const finalOptions = Object.assign(opts || {}, { brokers: brokers })
    kafka = new Kafka(finalOptions);
    return Promise.resolve(kafka)
}
