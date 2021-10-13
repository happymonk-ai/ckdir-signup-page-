import { randomBytes } from "@stablelib/random";
import stringify from 'fast-json-stable-stringify';
import * as u8a from 'uint8arrays';
import { B64_URL, B64, DagJWS } from "./did";

/**
 *
 * @param obj
 * @returns
 */


export function toStableObject(obj: Record<string, any>): Record<string, any> {
	return JSON.parse(stringify(obj)) as Record<string, any>;
}
/**
 *
 * @returns
 */

export function randomString(): string {
	return u8a.toString(randomBytes(16), 'base64');
}
/**
 *
 * @param s
 * @returns
 */

export function base64urlToJSON(s: string): Record<string, any> {
	return JSON.parse(u8a.toString(u8a.fromString(s, B64_URL))) as Record<string, any>;
}
/**
 *
 * @param bytes
 * @returns
 */

export function encodeBase64(bytes: Uint8Array): string {
	return u8a.toString(bytes, B64);
}
/**
 *
 * @param bytes
 * @returns
 */


export function encodeBase64Url(bytes: Uint8Array): string {
	return u8a.toString(bytes, B64_URL);
}
/**
 *
 * @param s
 * @returns
 */

export function decodeBase64(s: string): Uint8Array {
	return u8a.fromString(s, B64);
}
/**
 *
 * @param jws
 * @returns
 */

export function fromDagJWS(jws: DagJWS): string {
	if (jws.signatures.length > 1)
		throw new Error('Cant convert to compact jws');
	return `${jws.signatures[0].protected}.${jws.payload}.${jws.signatures[0].signature}`;
}
