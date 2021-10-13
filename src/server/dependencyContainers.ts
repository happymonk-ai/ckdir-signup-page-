import { AbortController, AbortSignal } from "abort-controller";
import NodeCache from "node-cache";
import {
  container as globalDIContainer,
  DependencyContainer,
  InjectionToken,
} from "tsyringe";
import EnvConfig from "../config";
import Libp2pFactory, { libp2pDIToken } from "../bootstrap/Libp2pFactory";
import IpfsFactory, { ipfsAppDIToken } from "../bootstrap/IpfsFactory";
import FasitfyFactory, { fastifyAppDIToken } from "../bootstrap/fastifyFactory";
import RedisFactory, { redisAppDIToken } from "../bootstrap/RedisFactory"
import ChokidrDocumentManager from "../DocumentManager/ChokidrDocumentManager";
import DBFactory ,{databaseDIToken} from "../bootstrap/DbFactory";
import { registerSingleton } from "../database/utils/registerSingleton";
import { ModuleInitializer } from "../modules/ModuleInitializer";
import { modulesDIToken } from "../modules/module";
import {graphQLResolversDIToken} from '../bootstrap/GraphQLResolverType';
import { graphqlQueriesModule } from "../modules/resolvers/GraphQLQueriesModule";

export const processDIToken: InjectionToken<NodeJS.Process> = "Process";
export const processEnvDIToken: InjectionToken<NodeJS.ProcessEnv> =
  "ProcessEnv";
export const diContainerDIToken: InjectionToken<DependencyContainer> =
  "Container";
export const documentManagerDIToken: InjectionToken<ChokidrDocumentManager> =
  "ChokidrDocumentManager";

export function createDIContainer(
  processEnv: NodeJS.ProcessEnv
): DependencyContainer {
  const diContainer = globalDIContainer.createChildContainer();
  diContainer.registerInstance(processDIToken, process);
  diContainer.registerInstance(processEnvDIToken, processEnv);
  diContainer.registerInstance(diContainerDIToken, diContainer);

  diContainer.registerInstance(NodeCache,new NodeCache({checkperiod:1}));
  registerInMemoryDatabase(diContainer);
  registerIPFS(diContainer)
  registerAbortion(diContainer);
  registerDocumentManager(diContainer);
  registerFastifyServer(diContainer);
  registerRedis(diContainer);
  registerModules(diContainer)

  diContainer.resolve(ModuleInitializer).initializeModules(diContainer);
  
  return diContainer;
}

// Register all the graphql Schema dependencies over here
function registerModules(diContainer: DependencyContainer) {
  diContainer.registerInstance(modulesDIToken,graphqlQueriesModule)
}


function  registerRedis(diContainer: DependencyContainer){
   registerSingleton(diContainer,redisAppDIToken,(container)=>container.resolve(RedisFactory));
}

function registerIPFS(diContainer: DependencyContainer) {
  registerSingleton(diContainer,libp2pDIToken, (container)=>container.resolve(Libp2pFactory));
  registerSingleton(diContainer, ipfsAppDIToken,(container)=>container.resolve(IpfsFactory));
}

// Register FastifyFactory to decorate fastify instance
function registerFastifyServer(diContainer: DependencyContainer) {
  registerSingleton(diContainer, fastifyAppDIToken, (container) =>
    container.resolve(FasitfyFactory).create()
  );
}
//
function registerAbortion(diContainer: DependencyContainer) {
  const abortController = new AbortController();
  diContainer.registerInstance(AbortController, abortController);
  diContainer.registerInstance(AbortSignal, abortController.signal);
}

function registerDocumentManager(diContainer: DependencyContainer) {
  registerSingleton(diContainer, documentManagerDIToken, (container) =>
    container.resolve(ChokidrDocumentManager).create()
  );
}

function registerInMemoryDatabase(diContainer: DependencyContainer) {
  registerSingleton(diContainer, databaseDIToken, (container) =>
    container.resolve(DBFactory)
  );
}
