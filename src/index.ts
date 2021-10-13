/**
 * Application Index, start file. 
 * Cleanup for handlers and specifications done. 
 */
import "reflect-metadata";

import './config';

import {AbortController} from 'abort-controller';
import {App} from './server/App';
import { createDIContainer } from "./server/dependencyContainers";
import { addAbortListener } from "./bootstrap/Abortion";

async function bootstrap():Promise<void>{
	const container = createDIContainer(process.env)
	const abortController = container.resolve(AbortController);
	setupUnhandledErrors(abortController)
	const app = container.resolve(App);
	['SIGINT','SIGTERM'].forEach((signal)=>process.on(signal,()=>void app.stop()));
	console.log('[App] Bootstrapping Application');
	await app.bootstrap();
	console.log('[App] Starting Application')
	await app.start();
	
	addAbortListener(abortController.signal,()=>void app.stop())
}


function setupUnhandledErrors(controller:AbortController){
	process.on('unhandledRejection',(error,_promise)=>{
		console.log('Unhandled Reject at Promise because of error',error)
		process.exitCode = 1;
		controller.abort()
	});

	process.on('uncaughtException',(error)=>{
		console.log('Unhandled Reject at Promise because of error',error)
		process.exitCode = 1;
		controller.abort()
	})
}

void bootstrap()

