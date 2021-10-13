import { injectAll, InjectionToken, singleton } from 'tsyringe';
import Fastify, { FastifyInstance } from "fastify";
import EnvConfig from '../config';


export const fastifyAppDIToken:InjectionToken<FastifyInstance> ="FastifyServer"

/**
 * Fastify Factory Instance
 * 
 */
@singleton()
export default class FastifyFactory{
    private app
    private config

    constructor(private readonly envConfig:EnvConfig){
        
    }
    create():FastifyInstance{
        this.app = Fastify({ logger: true });
        return this.app;
    }
}
