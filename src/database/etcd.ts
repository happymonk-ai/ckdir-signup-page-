/**
 * Happymonk Technology Pvt Ltd
 * iamhappymonk
 * ETCD Database Host. 
 */
import { Etcd3, isRecoverableError, Election, ElectionObserver, Campaign } from 'etcd3';
import type {IOptions} from 'etcd3';

import { nanoid } from 'nanoid';
import * as faker from 'faker';
import os from 'os'
import _ from 'lodash';
import chalk from 'chalk';
import { Policy, ConsecutiveBreaker, ExponentialBackoff } from 'cockatiel';
import EventEmitter from 'eventemitter3';
import {singleton} from 'tsyringe'
/**
 * Class Defination For ETCD3. Based on https://microsoft.github.io/etcd3/index.html
 * Read the database documentation for more information. 
 * 
 */
@singleton()
export class Etcd extends EventEmitter {

	private _db: Etcd3;
	private peerId:string;
	private hosts: string[];
	private _isLeader:boolean = false;
	private election:Election
	private observer:ElectionObserver
	private watchResolvers:Map<string,any>
	private campaign:Campaign
	public watchList:string[]=["*"]
	
	constructor(opts?: any) {
		super();
		this.hosts = opts?.hosts || ['http://164.52.208.218:2379', 'http://164.52.208.218:2380'];
		this._db = new Etcd3({
			hosts: this.hosts,
			faultHandling:{
				host: () => Policy.handleWhen(isRecoverableError).circuitBreaker(5000,new ConsecutiveBreaker(3)),
				global: Policy.handleWhen(isRecoverableError).retry().attempts(100),
				watchBackoff: new ExponentialBackoff()
			}
		});

	}


	async runCampaign (peerID?:string){
		if(!this._db){
			console.error('database dropped from the services. Restart Service Please')
			return;
		}
		this.election = this._db.election('singleton-job');
		this.campaign = await this.election.campaign(peerID || os.hostname());
		this.campaign.on('elected',()=>{
			console.log(chalk.green(`Elected ${peerID || os.hostname()}`));
			this._isLeader = true;	
		})
		this.campaign.on('error',(error)=>{
			console.log(chalk.red('Not the leader anymore'));
			setTimeout(this.runCampaign,4000)
		})

	}

	async observeLeader(){
		this.observer = await this.election.observe();
		const leader = this.observer.leader();
		this.observer.on('change',(leader)=>{
			console.log('Leader Changed to ', leader);
			this.observeLeader
		})
	}

	async cancelObservation(){
		this.observer.cancel();
	}


	async instantiateDb() {
		return new Promise<Etcd3>((resolve, reject) => {
			try {
				
				const id = ['/chokidr', '/happymonk/chokidr', '*', '/happymonk']
				id.forEach((i) => {
					console.log(`Setting id ${i}`);
					this.db.watch().prefix(i).create().then((watcher: any) => {
						watcher.on("disconnected", () => {
							console.log('Disconnected from the server');
						})
							.on("connected", () => {
								console.log(`Connected, Watching ${i}`);
							})
							.on("put", (res: any) => {
								console.log(`Sending Key : ${res.key.toString() + res.value.toString()}`);
							});
					})
				})
				resolve(this.db);
			} catch (error) {
				reject(error);
			}
		});
	}


	/**
	 * Return the currentDB instance that is running
	 */
	get db() {
		return this._db;
	}

	/**
	 * Get if the current instance is leader
	 */
	get isLeader(){
		return this._isLeader || false;
	}


	/**
	 * Set Value for the corresponding Key
	 * @param key 
	 * @param value 
	 * @returns 
	 */
	async set(key: string, value: any) {
		return new Promise<any>(async (resolve, reject) => {
			try {
				const { _db } = this;
				await _db.put(key).value(value);
			} catch (error) {
				reject(error);
			}
		})
	}

	/**
	 * Get Value for the corresponding key
	 * @param key 
	 * @param value 
	 * @returns 
	 */
	async get(key: string) {
		return new Promise<any>(async (resolve, reject) => {
			try {
				const { _db } = this;
				resolve (await _db.get(key));
			} catch (error) {
				reject(error);
			}
		})
	}


	async close() {
		this.cancelObservation();
		if(this._isLeader){
			this.campaign.resign();
		}
		this._db.close();
	}

}

let etcd:Etcd
export const getEtcd = async () => {
	return new Promise<Etcd>(async (resolve, reject) => {
		try {
			const e = new Etcd();
			resolve(e);
		} catch (error) {
			reject(error);
		}
	});
};


export const startEtcd = async(opts:any) => {
	return new Promise<Etcd>(async (resolve, reject)=>{
		try {
			console.log(chalk.red('No Instance of the connector Found... Creating a new one'));
			if(!etcd) {
				console.log(chalk.red('Creating a new Instance with default options'));
				const e = new Etcd();
				resolve(e)
			}
			resolve(etcd)	
		} catch (error) {
			reject(error)	
		}
	})
}


