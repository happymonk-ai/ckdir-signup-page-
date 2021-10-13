import { singleton, injectAll, inject, DependencyContainer, } from "tsyringe";
import EnvConfig from "../config";
import {
  CompositeModule,
  compositeModulesDIToken,
  Module,
  modulesDIToken,
} from "./module";
import { diContainerDIToken } from "../server/dependencyContainers";

@singleton()
export class ModuleInitializer {
  constructor(
    // @inject(diContainerDIToken) private readonly container: DependencyContainer,
    @injectAll(modulesDIToken) private readonly modules: Module[],
    private readonly envConfig: EnvConfig
  ) {}

  /**
   * initialize configured modules
   */
  initializeModules(container: DependencyContainer): void {
    this.modules.forEach(module =>{
      module.initialize(container)
    })
  }
}
