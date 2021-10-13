import { RouteShorthandOptions } from 'fastify';

export const resolverOptions: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			properties: {
				did: { type: 'string' }
			}
		}
	}
};
export const serviceOptions: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			properties: {
				did: { type: 'string' }
			}
		}
	}
};
export const registerOptions: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			properties: {
				did: { type: 'string' }
			}
		}
	}
};
export const requestOptions: RouteShorthandOptions = {};
