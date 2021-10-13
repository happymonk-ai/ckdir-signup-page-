import { ISocketIOOptions } from '../config';


export const socketIOOptions: ISocketIOOptions = {
	// path: "/test",
	serveClient: false,
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false,
	cors: [],
};
