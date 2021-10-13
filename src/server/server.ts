import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  underPressureOptions,
  guardOptions,
  rejectEncoding,
  compressOptions,
  staticOptions,
} from "../config/fastifyOptions";
import { RedisPubSub } from "graphql-redis-subscriptions";
import {
  container as GlobalDiContainer,
  DependencyContainer,
  inject,
  injectAll,
  singleton,
} from "tsyringe";
import ws from "ws";
import { execute, subscribe } from "graphql";

import { NonEmptyArray } from "type-graphql";
import { buildSchema } from "type-graphql";
import AltairFastify from "altair-fastify-plugin";
import helmet from "fastify-helmet";
import { FastifySSEPlugin } from "fastify-sse-v2";
import { GraphQLAuthChecker } from "../bootstrap/authChecker";
import { GraphQLErrorHandler } from "../bootstrap/GraphQLErrorHandler";
import { makeHandler } from "graphql-ws/lib/use/fastify-websocket";
import FastifyFactory from "../bootstrap/fastifyFactory";
import { nanoid } from "nanoid";
import EnvConfig from "../config";
import { diContainerDIToken } from "./dependencyContainers";
import RedisFactory from "../bootstrap/RedisFactory";
import {
  GraphQLResolverType,
  graphQLResolversDIToken,
} from "../bootstrap/GraphQLResolverType";
import {
  ExecutionResult,
  GraphQLError,
  GraphQLFormattedError,
  GraphQLSchema,
} from "graphql";
import fastifyWebsocket from "fastify-websocket";
import { ApolloServer } from "apollo-server-fastify";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ResolverContext } from "../bootstrap/resolverContext";
import { DateTime } from "luxon";
import { GraphQLDependencyContainer } from "./GraphQLDependencyContainer";
import { PubSub } from "graphql-subscriptions";
import mercurius, { IResolvers } from "mercurius";
import MercuriusGQLUpload from "mercurius-upload";

import { SubscriptionServer } from "subscriptions-transport-ws";

let nstats = require("nstats")();

const buildContext = async (req: FastifyRequest, _reply: FastifyReply) => {
  return {
    authorization: req.headers.authorization,
  };
};
const logAllRoutes = (request, response) => {
  console.log(request);
};

type ErrorFormatter = (error: GraphQLError) => GraphQLFormattedError;
type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  interface MercuriusContext
    extends PromiseType<ReturnType<typeof buildContext>> {}
}

export function fastifyAppClosePlugin(app: FastifyInstance) {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}

// TODO: Move envconfig
const origin = "www.chokidr.com";

const schema = `
  type Notification {
    id: ID!
    message: String
  }

  type Query {
    notifications: [Notification]
  }

  type Mutation {
    addNotification(message: String): Notification
  }

  type Subscription {
    notificationAdded(contains: String): Notification
  }
`;
const { withFilter } = mercurius;

let idCount = 1;
const notifications = [
  {
    id: idCount,
    message: "Notification message",
  },
];

const resolvers = {
  Query: {
    notifications: () => notifications,
  },
  Mutation: {
    addNotification: async (_, { message }, { pubsub }) => {
      const id = idCount++;
      const notification = {
        id,
        message,
      };
      notifications.push(notification);
      await pubsub.publish({
        topic: "NOTIFICATION_ADDED",
        payload: {
          notificationAdded: notification,
        },
      });

      return notification;
    },
  },
  Subscription: {
    notificationAdded: {
      subscribe: withFilter(
        (root, args, { pubsub }) => pubsub.subscribe("NOTIFICATION_ADDED"),
        (payload, { contains }) => {
          if (!contains) return true;
          return payload.notificationAdded.message.includes(contains);
        }
      ),
    },
  },
};

/**
 * Fastify Server Class Fact
 */
@singleton()
export default class Server {
  server: FastifyInstance;
  apolloServer: ApolloServer;
  config;

  private schema;

  constructor(
    private readonly envConfig: EnvConfig,
    private readonly fastifyfactory: FastifyFactory,
    private readonly errorHandler: GraphQLErrorHandler,
    private readonly redisFactory: RedisFactory,
    @inject(diContainerDIToken) private readonly container: DependencyContainer,
    @injectAll(graphQLResolversDIToken)
    private readonly resolvers: NonEmptyArray<GraphQLResolverType>
  ) {
    this.config = this.envConfig;
  }

  /**
   * GraphQL Error Formatter
   * @param context
   * @returns
   */
  private createErrorFormatter(
    context: ResolverContext | undefined
  ): ErrorFormatter {
    return (error): GraphQLFormattedError =>
      this.errorHandler.handle(error, context);
  }

  /**
   * Bootstrap Function
   * @param workerid
   */
  async bootstrap(workerid?: number) {
    this.server = await this.fastifyfactory.create();
    const pubsub = new PubSub();
    this.schema = await this.createSchema(pubsub);

    // this.server.register(fastifyWebsocket,{
    //   options:{
    //     maxPayload:1048576
    //   }
    // })
    this.server.register(MercuriusGQLUpload);
    this.server.register(mercurius, {
      schema: this.schema,
      subscription: true,
      federationMetadata: false,
      graphiql: false,
      ide: false,
      path: "/graphql",
    });

    // this.apolloServer = new ApolloServer({
    //   schema:schema3,
    //   context:(orginial):ResolverContext=>{
    //     const context = {
    //       ...orginial,
    //       requestId: nanoid(24),
    //       startTime: DateTime.now().toMillis(),
    //       container:this.container
    //     }
    //     return context;
    //   },
    //   debug:false,
    //   formatError: this.createErrorFormatter(undefined), // ? does not work when trying to boot
    //   plugins:[fastifyAppClosePlugin(this.server),ApolloServerPluginDrainHttpServer({httpServer:this.server.server})]
    // });

    this.server.register(AltairFastify, {
      path: "/altair",
      baseURL: "/altair/",
      endpointURL: "/graphql",
    });
    this.server.get("*", logAllRoutes); // Log
    this.server.get("/metrics", (req, res) => {
      res.code(200).send(nstats.toPrometheus());
    });
    this.server.register(
      require("fastify-cors"),
      (instance) => (req, callback) => {
        let corsOptions;
        if (/localhost/.test(origin)) {
          corsOptions = { origin: false };
        } else {
          corsOptions = { origin: true };
        }
        callback(null, corsOptions);
      }
    );

    // this.server.get('/sub',{websocket:true},makeHandler({schema:schema3}))

    // console.log("[SERVER]  🚀  Registering Helmet");
    // this.server.register(helmet);
    console.log(
      "[SERVER]  🚀  Registering UnderPressure.. ",
      underPressureOptions
    );
    // server.register(require("under-pressure"), underPressureOptions);
    console.log(
      "[SERVER]  🚀  Registering Compress. Setting to",
      compressOptions
    );
    this.server.register(require("fastify-compress"), compressOptions);
    console.log("[SERVER]  🚀  Registering Boom");
    await this.server.register(require("fastify-boom"));
    console.log("[SERVER]  🚀   Registering SSE Plugin");
    await this.server.register(FastifySSEPlugin);
    await this.server.register(nstats.fastify(), {
      ignored_routes: ["metrics", "health"],
    });
  }

  private async createSchema(pubsub: PubSub): Promise<GraphQLSchema> {
    return await buildSchema({
      resolvers: this.resolvers,
      validate: false,
      pubSub: pubsub,
      container: new GraphQLDependencyContainer(this.container),
    });
  }

  async start(): Promise<void> {
    try {
      // await this.apolloServer.start();
      // await this.server.register(this.apolloServer.createHandler())
      // console.log("[SERVER] 🧞 Starting SERVER on", this.apolloServer.graphqlPath);
      await this.server.listen(this.config.port, () => {
        new SubscriptionServer(
          { execute, subscribe, schema: this.schema },
          { noServer: true, path: "/graphql" }
        );
        console.log("Subscription Server registered");
      });
      const address = this.server.server.address();
      console.log("Address Information ", address);

      // setInterval(()=>{
      //   console.log(nstats.toJson());
      // },10000)
    } catch (error) {
      throw error;
    }
  }

  async stop(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log("[ChokidrService] Closing Server");
        if (this.server) await this.server.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
