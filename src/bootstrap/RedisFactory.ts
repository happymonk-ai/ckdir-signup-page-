import Redis from 'ioredis';
import {RedisPubSub} from "graphql-redis-subscriptions";
import { singleton, InjectionToken } from 'tsyringe';
import EnvConfig from '../config';

const host = "redis";
const port = 6379;

export const redisAppDIToken: InjectionToken<RedisFactory> = "RedisPubSubFactory";

@singleton()
export default class RedisFactory {
    private host:string
    private port:number

    private _pubsub:RedisPubSub

    constructor(private readonly envConfig:EnvConfig){
        this.host = host;
        this.port = port;
    }

    get pubsub(){
        if(!this._pubsub) throw new Error('PubSub not initialized');
        return this._pubsub;
    }

    async bootstrap():Promise<void>{
        this._pubsub = new RedisPubSub({
            publisher:new Redis({
                host:this.host,
                port:this.port
            }),
            subscriber:new Redis({
                host:this.host,
                port:this.port
            })
        })
        return Promise.resolve()
    }

    start(){

    }

    stop(){

    }

}