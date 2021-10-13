import { InjectionToken } from "tsyringe";

export interface NonNullishValue {} 


export type Constructor<T extends NonNullishValue = NonNullishValue> = new (...args: any[]) => T;


export type GraphQLResolverType = Constructor;


export const graphQLResolversDIToken:InjectionToken<GraphQLResolverType> = 'GraphQLResolver';



