import {ApolloError} from 'apollo-server-core';
import EnvConfig from '../config';
import {GraphQLError, GraphQLFormattedError} from 'graphql';
import {singleton} from 'tsyringe';
import {ResolverContext} from "./resolverContext";
import {nanoid} from 'nanoid';
import * as typeGraphQL from 'type-graphql';

export type AllProperties<T> = {
    [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};


@singleton()
export class GraphQLErrorHandler{
    constructor(
        private readonly envConfig:EnvConfig
    ){}

    handle(error: GraphQLError, context:ResolverContext | undefined):GraphQLFormattedError{
        const requestId = context?.requestId;
        if(isUserErrorType(error)){
            return getSignificantProperties(error)
        }
        const errorId = nanoid(24);
        const message = `An internal server error occured for ${requestId} Actual {error}.`;
        if(this.envConfig.logging){
            return {
                ...getSignificantProperties(error),
                message:`${message}(loggingOnly):requestId ${requestId} and {error} ${error.message}`
            }
        }
        return {message};
    }
}


const userErrorTypes = [ApolloError, typeGraphQL.ArgumentValidationError, typeGraphQL.ForbiddenError, typeGraphQL.UnauthorizedError];


export function isUserErrorType(error:Error):boolean{
    if(userErrorTypes.some((t)=> error instanceof t)){
        return true;
    }
    if(error instanceof GraphQLError && userErrorTypes.some((t)=> error.originalError instanceof t)){
        return true;
    }
    return false;
}

function getSignificantProperties(error:GraphQLError):AllProperties<GraphQLFormattedError>{
    return{
        message:error.message,
        locations:error.locations,
        path:error.path,
        extensions:error.extensions,
    }
}