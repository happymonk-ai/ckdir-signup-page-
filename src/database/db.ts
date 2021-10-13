import level from "level-rocksdb";
import { getEtcd } from "./etcd";
import { Etcd3 } from "etcd3";
import EventEmitter from "eventemitter3";
import chalk from "chalk";
import IPFS from "ipfs-core/src/components";
import { loadConfig } from "../config";
import { getIPFSClient } from "../clients/ipfs";
import {singleton} from 'tsyringe';
var sub = require("subleveldown");


const config = loadConfig();


/**
 * Get a instance of the database that needs to be connected
 */
@singleton()
export class DB extends EventEmitter {
  private _db;
  private _isLoaded: boolean = false;
  
  constructor() {
    super();
  }

  get db(){
    if(!this._db) throw new Error("No database created")
    return  this._db
  }

  get isLoaded(){
    return this._isLoaded;
  }


  init = async (store:string="default") => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Opening LevelStore')
        this._db = await level(`./ckdrlevelstore${store}`, config.database.inmemory.rocksdb);
        process.on("dbonline", (value) => {
          console.log(chalk.green("memory_dbonline"));
          this._isLoaded = true;
        });
        await this._db.open();
        if (this._db.isOpen()) {
          console.log(chalk.green("[DB] Online... Wating for Input"));
          this.emit("dbonline", true);
        }
        resolve(this._db);
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Get Sublevel of database from the
   * @param level
   * @returns
   */
  getSubLevel = async (level: string) => {
    return new Promise<string>((resolve, reject) => {
      try {
        if (!this._db)
          throw new Error(
            "Database not defined, cannot resolve, sublevel Instance"
          );
        resolve(sub(this._db, level));
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Updates the _db with the given Keybase
   * @param key
   * @param value
   * @returns
   */
  put(key: string | Uint8Array, value: Uint8Array): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      if (this._db.isOpen()) {
        this._db.put(key, value, (err: Error) => {
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
      if (this._db.isOpen()) {
        this._db.get(key, (err: Error, data: any) => {
          if (err) reject(err);
          resolve(data);
        });
      } else {
        reject(new Error("Database not open"));
      }
    });
  }

  /**
   *
   * @returns
   */
  async clear() {
    return new Promise((resolve, reject) => {
      try {
        this._db.clear();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * Stop the database
   */
  async stop() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this._db && this._db?.isOpen()) {
          await this.clear();
          this._db.close();
        } 
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default DB;
