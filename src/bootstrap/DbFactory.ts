import level from "level-rocksdb";
import EventEmitter from "eventemitter3";
import chalk from "chalk";
import { loadConfig } from "../config";
import { singleton,InjectionToken } from "tsyringe";
import EnvConfig from "../config";
var sub = require("subleveldown");


export const databaseDIToken:InjectionToken<DBFactory> ="DBFactory"

/**
 * Database Factory for inmemory database
 */
@singleton()
export default class DBFactory extends EventEmitter {
  private _db;
  private rocksdbConfig;
  private name;

  constructor(private readonly envConfig: EnvConfig) {
    super();
    this.rocksdbConfig = this.envConfig.database.inmemory.rocksdb;
    this.name = this.envConfig.database.inmemory.name;
  }
  /**
   * 
   */
  get db() {
    if (!this._db) throw new Error("No database created");
    return this._db;
  }

  /**
   * 
   * @param store 
   * @returns 
   */
  async create(store: string = "default"): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        console.log('[CHOKIDRSERVICE] Creating levelstore instance...')
        this._db = await level(`${this.name}${store}`, this.rocksdbConfig);
        resolve(this._db);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 
   * @returns 
   */
  start = async () => {
    return new Promise(async (resolve, reject) => {
      try {
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
   *
   * @returns
   */
  async clear() {
    return new Promise((resolve, reject) => {
      try {
          if(!this._db) throw new Error('Database Not initialized.')
          console.log('Clearing the current DB') 
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
  async stop(clear:boolean=false):Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (this._db && this._db?.isOpen()) {
            if(clear){
                await this.clear();
            }
          console.log('Closing DB. Releasing Database Lock')
          await this._db.close();
          resolve
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
