import {GraphQLScalarType} from 'graphql';
import {GraphQLJSONObject} from 'graphql-type-json';
import {GraphQLISODateTime} from 'type-graphql';



export interface Base58HashScalarConfig{
    readonly name:string;
    readonly description:string;
}

export interface ScalarConfig<T>{
    readonly name:string
    readonly description:string;
    parseValue(value:string):T;
}



export function createScalar<T extends {toString():string}>(config:ScalarConfig<T>):GraphQLScalarType{
 return 
}



export const Scalar = {
    hash: new GraphQLScalarType({
        name: 'hash',
        description: ' Hash Representation of DataObject'
    }),
    BLSProof:GraphQLJSONObject,
    CreatedTime:GraphQLISODateTime,
    Block:GraphQLJSONObject
}