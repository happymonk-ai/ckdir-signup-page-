import {singleton} from 'tsyringe'
import EnvConfig from '../config'
import { ResolverContext } from './resolverContext'

export const apiKeyHeader = 'X-CHOKIDR-Key';

@singleton()
export class GraphQLAuthChecker{
    constructor(private readonly envConfig: EnvConfig){}

    check(context:ResolverContext):boolean{
        if(!this.envConfig.apiKey){
            return true;
        }
        const apiKey:string | undefined = context.connection?.context[apiKeyHeader]; //eslint-disable-line
        if(apiKey!=this.envConfig.apiKey){
            throw new Error(`Specified Value ${apiKey} of GraphQL authorization header variable is invalid`);
        }
    }
}