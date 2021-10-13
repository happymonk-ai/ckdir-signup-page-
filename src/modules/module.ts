import { DependencyContainer, InjectionToken } from "tsyringe";

export enum ModuleName {
  ResolversGraphQL = "ResolversGraphQL",
}

export enum CompositeModuleName {
  SubscriptionGraphQL = "SubscriptionGraphQL",
}

export interface ModuleDependency {
  validate(
    thisModuleName: ModuleName,
    enabledModuleNames: readonly ModuleName[]
  ): void;
}

export interface Module {
  readonly name: ModuleName;
  readonly dependencies: readonly ModuleDependency[];
  initialize(diContainer: DependencyContainer): void;
}

export class CompositeModule {
  constructor(
    readonly name: CompositeModuleName,
    readonly mappedModuleNames: readonly ModuleName[]
  ) {}
  
//   Create Composite module. 
  static create(
    name: CompositeModuleName,
    modules: readonly Module[]
  ): CompositeModule {
    return new CompositeModule(
      name,
      modules.map((module) => module.name)
    );
  }
}

export const modulesDIToken: InjectionToken<Module> = "Modules";
export const compositeModulesDIToken: InjectionToken<CompositeModule> = "CompositeModules";
