import {AbortSignal} from 'abort-controller';


export function isAbortError(error:unknown):boolean{
    return error instanceof Error && error.name === "AbortError";
}

export function addAbortListener(signal:AbortSignal, listener:()=>void){
    signal.addEventListener('abort',listener);
    return ():void => signal.removeEventListener('abort',listener)
}

export function throwIfAborted(signal:AbortSignal):void{
    if(signal.aborted){
        throw new AbortError()
    }
}

export class AbortError extends Error{
    readonly name = "AbortError";
    constructor(){
        super('[CKDR][ERROR] Operation Aborted without a cause')
    }
}