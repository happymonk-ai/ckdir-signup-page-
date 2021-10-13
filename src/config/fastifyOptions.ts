import path from 'path'


/**
 * Fastify Underpressure Options
 */
export const underPressureOptions = {
	maxEventLoopDelay: 1000,
	maxHeapUsedBytes: 100000000,
	maxRssBytes: 100000000,
	maxEventLoopUtilization: 0.98
};



/**
 * Fastify Gaurd Otions
 */
export const guardOptions = {
	errorHandler:(result,req,reply)=>{
		return reply.send('Illegal Access to route')
	}
}

/**
 * Fastify Server Encoding Options
 * @param encoding 
 * @param request 
 * @param reply 
 * @returns 
 */
 export const rejectEncoding: (encoding: any, request: any, reply: any) => string = (encoding, request, reply) => {
	reply.code(406);
	return `Encoding format ${encoding} not supported`;
};

/**
 * Fastify Compress Options
 */
 export const compressOptions = {
	global: false, onUnspportedEncoding: rejectEncoding
};

/**
 * Static Website Serving Option for the node 
 * FOR Testing Purpose Only
 */
export const staticOptions = {
	root: path.join(__dirname, 'public'),
	prefix: '/public/',
};
