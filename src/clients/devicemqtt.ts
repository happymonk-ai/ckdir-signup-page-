import mqtt from 'mqtt';
import faker from 'faker';

import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import * as dagCbor from '@ipld/dag-cbor'
import * as dagJose from 'dag-jose'
import {
	ES256KSigner,
	createJWS,
	verifyJWS
} from 'did-jwt'
import {
	encodePayload,
	toJWSPayload,
	toJWSStrings
} from 'dag-jose-utils'


const main = async () => {
	console.log('connecting to mqtt client')
	const client = mqtt.connect('mqtt://test.mosquitto.org');
	client.on('connect', () => {
		console.log('connected to the url')
		client.subscribe('presence', (err) => {
			if (err) throw err
			client.publish('presence', 'ok')
		});
	});
}

const getMqttClient = async () => {
	return new Promise((resolve, reject) => {
		try {
			return mqtt.connect('mqtt://test.mosquitto.org');
		} catch (error) {
			reject(error);
		}
	})
}

const pulishLocation = async (client) => {
	const did = "";
	const longitude = faker.address.longitude;
	const latitude = faker.address.latitutde;
	const cardinalDirection = faker.address.cardinalDirection;
	// do we convert it into block over here?
}

main().catch((err) => {
	console.log(err);
})