import * as mqtt from 'mqtt';
import { Responder, Requester } from 'cote';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import EventEmitter from 'eventemitter3';
import { MqttClient, IClientOptions } from 'mqtt';
import { resolveLater } from '../utils/index';
import {singleton} from 'tsyringe'
// const Key = fs.readFileSync(path.join(__dirname, '../certificates/tls-key.pem'));
// const Cert = fs.readFileSync(path.join(__dirname, '../certificates/tls-cert.pem'));
// const TRUSTED_CA_LIST = fs.readFileSync(path.join(__dirname, '../certificates/crt.ca.pg.pem'));
const PORT = 1833
const HOST = 'chokidr.ml'


export const mqttOptions = {
	port: PORT,
	host: HOST,
	// key: Key,
	// cert: Cert,
	// ca: TRUSTED_CA_LIST,
	protocols: 'mqtts',
	rejectUnauthorized: false
}

const [mqttPromise, resolveMqtt] = resolveLater<MQTT>()



export const getMqtt = async () => {
	return mqttPromise;
}


export const startMqtt = async ():Promise<MQTT> => {
	const mqtt = new MQTT();
	return mqtt
}

@singleton()
export default class MQTT extends EventEmitter {

	client: MqttClient
	etl = null
	constructor(etl=null){
		super();
		this.etl = etl || null;
	}
	async connect(url?:string, opts?:IClientOptions){
		const connectionUrl= url || 'mqtt://test.mosquitto.org'
		this.client = mqtt.connect(connectionUrl,{reconnectPeriod:1000, resubscribe:true});
		this.client.on('error',(error)=>{
			this.emit('error',error)
		});
		this.client.on('offline',()=>{
			this.emit('mqtt:offine')
		});
		this.client.on('reconnect',()=>{
			this.emit('mqtt:reconnect');
			console.log(chalk.green('[MQTT] Broker Reconnected'));
		});
		this.client.on('end',()=>{
			console.log(chalk.red('[MQTT] Broker Ended'))
		});
		this.client.on('connect', () => {
			console.log(chalk.green('MQTT Connected'));
			this.emit('mqtt:connected')
			this.client.subscribe('presence', (err) => {
				if (err) throw err
				this.client.publish('presence', 'ok')
			});
		});

		this.addListener('startOfBridge',()=>{
			console.log('Some execution')
		})

	}

	async getClient(){
		if(!this.client) return Promise.resolve(this.client)
	}

	async subscribe(topic,cb){
		this.client.subscribe(topic,cb);
	}

	close(){
		if(this.client){
			this.client.end();
		}
	}

}
