import { DependencyContainer } from "tsyringe";
import { ContainerType, ResolverData } from "type-graphql";

/** Adapts Tsyringe dependency injection container to TypeGraphQL framework so that DI can be used in GraphQL resolvers.
 *
 * As per gitter conversation in typegraphql
 */



export class GraphQLDependencyContainer implements ContainerType {
  constructor(private readonly tsyringeContainer: DependencyContainer) { }

  /* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
  get(someClass: any, _resolverData: ResolverData<any>): any | Promise<any> {
    return this.tsyringeContainer.resolve(someClass);
  }
}
