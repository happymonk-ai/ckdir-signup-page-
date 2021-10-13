import {
    MercuriusContext
  } from 'mercurius';
import { DependencyContainer } from 'tsyringe';

  export interface ResolverContext extends Partial<MercuriusContext>{
      container:DependencyContainer
      requestId:string
      connection?:any
  }
