import level from 'level-rocksdb';
import { getEtcd } from './etcd';
import { Etcd3 } from 'etcd3';
import EventEmitter from 'eventemitter3';
import chalk from 'chalk';
var sub = require('subleveldown')



/**
 * Enum Defination for the query Parameters
 */
export enum queryType {
	INSERT = "INSERT",
	UPDATE = "UPDATE",
	DELETE = "DELETE",
	INSTREAM = "INSTREAM",
	OUTSTREAM = "INSTREAM",
	NEXTBLOCK = "NEXTBLOCK",
}


/**
 * 
 */
export interface IDBConfig {
    uri: string
    cache?: boolean
    master?: boolean
    etcd?: {
        url: string
        master: boolean
        port: string[]
    }
    ipfs?: {
        peerID?: string
        publicKey?: string
        secretKey?: string
    }
    sync?: boolean
}

/**
 * Parameter Defination
 */
export type Parameters = {
	subject?: string
	object?: string
	predicate?: string
	did?: string
}

/**
 * Inteface For Paramers
 */
export interface IParams {
	type: queryType
	params: Parameters
}


/**
 * 
 */
export class DB extends EventEmitter {
	db;
	isLoaded: boolean = false;
	cache: Map<string, any>;
	edb: Etcd3;


	constructor() {
		super()
	}

	

	/**
	 * Get Sublevel of database from the 
	 * @param level 
	 * @returns 
	 */
	async getSubLevel(level:string){
		return new Promise<string>((resolve, reject) => {
			try {
				resolve(sub(this.db,level))
			} catch (error) {
				reject(error)
			}
		})
	}

	async start() {
		return new Promise(async (resolve, reject) => {
			try {
				this.db = await level('./ckdr-t4', { createIfMissing: true, valueEncoding: 'binary', keyEncoding: 'string'});
				await this.db.open();
				if (this.db.isOpen()) {
					console.log(chalk.green('[DB] Online... Wating for Input'))
					this.emit('dbonline', true)
				}
				this.cache = new Map<string, any>();
				// this.edb = await getEtcd()
				process.on('dbonline', (value) => {
					console.log(chalk.green('memorydbonline'))
					this.isLoaded = true;
				});
				resolve(true)
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Updates the db with the given Keybase 
	 * @param key 
	 * @param value 
	 * @returns 
	 */
	put(key: string | Uint8Array, value: Uint8Array): Promise<Boolean> {
		return new Promise<Boolean>((resolve, reject) => {
			if (this.db.isOpen()) {
				this.db.put(key, value, (err: Error) => {
					if (err) reject(err);
					resolve(true);
				});
			} else {
				reject(new Error("Database not open"));
			}
		});
	}
	/**
	 * 
	 * @param key 
	 * @returns 
	 */
	get(key: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (this.db.isOpen()) {
				this.db.get(key, (err: Error, data: any) => {
					if (err) reject(err);
					resolve(data);
				});
			} else {
				reject(new Error('Database not open'));
			}
		});
	}
	/**
	 * 
	 * @param data 
	 * @returns 
	 */
	batch(data) {
		return new Promise<any>((resolve, reject) => {
			if (this.db.isOpen()) {
				this.db.batch(data, (err) => {
					reject(err);
				})
				resolve(true);
			} else {
				reject(new Error('Database not open'));
			}
		});
	}
	/**
	 * Create readable stream for give set of keys and perform the function on 
	 * @param key 
	 * @returns 
	 */
	createReadableStream(key: string) {
		return new Promise<any>((resolve, reject) => {
			try {
				this.db.on(key, async (data) => {
					console.log('Current Data in', key);
					await this.edb.put(data.key).value(data.value)
					resolve(true)
				}).on('error', (err) => {
					reject(err);
				});
			} catch (error) {
				reject(error);
			}
		})

	}
	/**
	 * 
	 * @returns 
	 */
	async clear() {
		return new Promise((resolve, reject) => {
			try {
				this.db.clear();
				resolve(true);
			} catch (error) {
				reject(error);
			}
		})
	}
	/**
	 * Stop the database 
	 */
	async stop() {
		return new Promise(async (resolve, reject) => {
			try {
				if (this.db.isOnline()) {
					// free all the current resoucres in the queue
					await this.clear();
					this.db.close();
				} else {
					reject(new Error('Database not open'));
				}
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default new DB();
