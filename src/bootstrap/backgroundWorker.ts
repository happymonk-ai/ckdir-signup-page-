import {AsyncOrSync} from 'ts-essentials';
import {InjectionToken} from 'tsyringe';


export interface BackgroundWorker{
    readonly name:string;
    start():AsyncOrSync<void>,
    stop():AsyncOrSync<void>
}

export const backgroundWorkerDIToken:InjectionToken<BackgroundWorker>="BackgroundWorkers"