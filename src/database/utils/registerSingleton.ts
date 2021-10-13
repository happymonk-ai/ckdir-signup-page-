import {
    DependencyContainer,
    InjectionToken
} from "tsyringe";


export function registerSingleton<T>(
    diContainer: DependencyContainer,
    token: InjectionToken,
    factory: (c: DependencyContainer) => T
): void {
    diContainer.register(token, { useFactory: factory });
}
/**
 * Get the DIT
 * @param uniqueName 
 * @returns 
 */
export function getDIToken<T>(uniqueName: string): InjectionToken<T> {
    return uniqueName;
}
