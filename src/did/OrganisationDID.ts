import { create as createIpfs } from 'ipfs'
import { convert as toLegacyIpld } from 'blockcodec-to-ipld-format'
import stringify from 'fast-json-stable-stringify'
import { ResolverOptions, DIDResolutionResult, ResolverRegistry, Resolver } from 'did-resolver'
import type CID from 'cids'
import * as dagJose from 'dag-jose'
import { xc20pDirEncrypter, xc20pDirDecrypter, x25519Encrypter, x25519Decrypter, decryptJWE, createJWE, JWE, EdDSASigner, createJWS } from 'did-jwt'
import { verifyJWS, resolveX25519Encrypters } from 'did-jwt'
import { randomBytes } from '@stablelib/random'
import type { AuthParams, DIDMethodName, DIDProviderMethods, DIDProvider, GeneralJWS } from 'dids'
import * as u8a from 'uint8arrays'
import { encodePayload, prepareCleartext, decodeCleartext } from 'dag-jose-utils'
import { generateKeyPairFromSeed, convertSecretKeyToX25519 } from '@stablelib/ed25519'
import BLS from 'crypto/BLS'

const B64 = 'base64pad'
const B64_URL = 'base64url'

export interface VerifyJWSOptions {
	atTime?: number
	disableTimecheck?: boolean
}

export interface VerifyJWSResult {
	kid: string
	payload?: Record<string, any>
	didResolutionResult: DIDResolutionResult
}

export interface AuthenticateOptions {
	provider?: DIDProvider
	aud?: string
	paths?: Array<string>
}

export interface AuthenticateParams {
	nonce: string
	aud?: string
	paths?: Array<string>
}
export interface AuthenticateResponse extends AuthenticateParams {
	did: string
	exp: number
}
export interface CreateJWEOptions {
	protectedHeader?: Record<string, any>
	aad?: Uint8Array
}

export interface DecryptJWEOptions {
	did?: string
}

export interface DecryptJWEResult {
	payload?: string // base64-encoded
}


export type KeyPair = {
	readonly publicKey: Uint8Array,
	readonly secretKey: Uint8Array,
}
export type DagJWS = {
	payload: string
	signatures: Array<JWSSignature>
	link?: CID
}
export type JWSSignature = {
	protected: string
	signature: string
}
export type CreateJWSParams = {
	payload: Record<string, any>
	protected?: Record<string, any>
	revocable?: boolean
	did: string
}

export type DecryptJWEParams = {
	jwe: JWE
	did?: string
}

export interface IODID {
	//basic types
	_id: string
	_blsid: string
	_peerID: string

	// mixed types
	edKey: KeyPair
	blsKey: KeyPair

	// define any booleans
	isAuthenticated: boolean

	// define all the functions
	get id(): string
	get authenticated(): boolean
	encodeDID(publicKey: Uint8Array)
	did_authenticate(did, secretKey, { aud, nonce, paths })
	createJWE(payload: Uint8Array, recipients: Array<string>, options: CreateJWEOptions)
	decrypteJWE(jwe: JWE, options: DecryptJWEResult)
	storeJWE(db,jwe)
	signJWE(jwe: JWE)
	verifyJWE(jwe: JWE)
	createJWS(payload, options: CreateJWSOptions)
	blsSignature(seed)
	issue()
	verifySignature(signature)
	proof()
	verifyProof()
	generateSuite()
	issueVerifiableCredentials(suite, documentloader)

	resolve(did: string, key: string)
	sync()
}

export function toStableObject(obj: Record<string, any>): Record<string, any> {
	return JSON.parse(stringify(obj)) as Record<string, any>
}
export function randomString(): string {
	return u8a.toString(randomBytes(16), 'base64')
}
export function base64urlToJSON(s: string): Record<string, any> {
	return JSON.parse(u8a.toString(u8a.fromString(s, B64_URL))) as Record<string, any>
}
export function encodeBase64(bytes: Uint8Array): string {
	return u8a.toString(bytes, B64)
}

export function encodeBase64Url(bytes: Uint8Array): string {
	return u8a.toString(bytes, B64_URL)
}

export function decodeBase64(s: string): Uint8Array {
	return u8a.fromString(s, B64)
}

export function fromDagJWS(jws: DagJWS): string {
	if (jws.signatures.length > 1) throw new Error('Cant convert to compact jws')
	return `${jws.signatures[0].protected}.${jws.payload}.${jws.signatures[0].signature}`
}


export class ODID implements IODID {

	createJWS(payload: any, options: any) {
		throw new Error('Method not implemented.')
	}

	_id: string
	_blsid: string
	_peerID: string
	edKey: KeyPair
	blsKey: KeyPair
	isAuthenticated: boolean
	_resolver: any

	get id(): string {
		if (this._id == null) {
			throw new Error('DID is not authenticated')
		}
		return this._id
	}

	get authenticated(): boolean {
		return this._id != null
	}

	async authenticate(aud, paths = []) {
		const nonce = randomString();
		const jws = await this.did_authenticate(this._id, this.edKey.secretKey, { nonce, aud, paths });
		const { kid } = await this.verifyJWS(jws)
		const payload = base64urlToJSON(jws.payload) as AuthenticateResponse
		if (!kid.includes(payload.did)) throw new Error('Invalid authencation response, kid mismatch')
		if (payload.nonce !== nonce) throw new Error('Invalid authencation response, wrong nonce')
		if (payload.aud !== aud) throw new Error('Invalid authencation response, wrong aud')
		if (payload.exp < Date.now() / 1000) throw new Error('Invalid authencation response, expired')
		this._id = payload.did
		return this._id
	}

	/**
	 * 
	 * @param payload 
	 * @param did 
	 * @param secretKey 
	 * @param protectedHeader 
	 * @returns 
	 */
	async sign(payload: Record<string, any>, did: string, secretKey: Uint8Array, protectedHeader: Record<string, any> = {}) {
		const kid = `${did}3${did.split(':')[2]}`
		const signer = EdDSASigner(u8a.toString(secretKey, B64))
		const header = toStableObject(Object.assign(protectedHeader, { kid, alg: 'EdDSA' }));
		return createJWS(toStableObject(payload), signer, header);
	}

	/**
	 * 
	 * @param publicKey 
	 * @returns 
	 */
	async encodeDID(publicKey: Uint8Array): Promise<string> {
		const bytes = new Uint8Array(publicKey.length + 2)
		bytes[0] = 0xed // ed25519 multicodec
		bytes[1] = 0x01
		bytes.set(publicKey, 2)
		return Promise.resolve(`did:key:z${u8a.toString(bytes, 'base58btc')}`)
	}


	/**
	 * 
	 * @param jws 
	 * @param options 
	 * @returns 
	 */
	async verifyJWS(jws: string | DagJWS, options: VerifyJWSOptions = {}): Promise<VerifyJWSResult> {
		if (typeof jws !== 'string') jws = fromDagJWS(jws)
		const kid = base64urlToJSON(jws.split('.')[0]).kid as string
		if (!kid) throw new Error('No "kid" found in jws')
		const didResolutionResult = await this.resolve(kid)
		const timecheckEnabled = !options.disableTimecheck
		if (timecheckEnabled) {
			const nextUpdate = didResolutionResult.didDocumentMetadata?.nextUpdate
			if (nextUpdate) {
				// This version of the DID document has been revoked. Check if the JWS
				// was signed before it the revocation happened.
				const isEarlier = options.atTime && options.atTime < new Date(nextUpdate).valueOf()
				const isLater = !isEarlier
				if (isLater) {
					// Do not allow using a key _after_ it is being revoked
					throw new Error(`invalid_jws: signature authored with a revoked DID version: ${kid}`)
				}
			}
			// Key used before `updated` date
			const updated = didResolutionResult.didDocumentMetadata?.updated
			if (updated && options.atTime && options.atTime < new Date(updated).valueOf()) {
				throw new Error(`invalid_jws: signature authored before creation of DID version: ${kid}`)
			}
		}

		const publicKeys = didResolutionResult.didDocument?.verificationMethod || []
		// verifyJWS will throw an error if the signature is invalid
		verifyJWS(jws, publicKeys)
		let payload
		try {
			payload = base64urlToJSON(jws.split('.')[1])
		} catch (e) {
			// If an error is thrown it means that the payload is a CID.
		}
		return { kid, payload, didResolutionResult }
	}

	/**
	 * Resolve the DID Document of the given DID.
	 *
	 * @param didUrl              The DID to resolve
	 */
	async resolve(didUrl: string): Promise<DIDResolutionResult> {
		const result = await this._resolver.resolve(didUrl)
		if (result.didResolutionMetadata?.error) {
			const { error, message } = result.didResolutionMetadata
			const maybeMessage = message ? `, ${message as string}` : ''
			throw new Error(`Failed to resolve ${didUrl}: ${error}${maybeMessage}`)
		}
		return result
	}


	async createJWE(payload: Uint8Array, recipients: Array<string>, options: CreateJWEOptions): Promise<JWE> {
		return new Promise<JWE>(async (resolve, reject) => {
			try {
			const encrypters = await resolveX25519Encrypters(recipients, this._resolver);
				resolve(createJWE(payload, encrypters, options.protectedHeader, options.aad));
			} catch (error) {
				reject(error)
			}
		});
	}

	/**
	 * Decrypt JWE for the secified DID. IF the did is not assigned it will reject with a error
	 * @param jwe 
	 * @param options 
	 * @returns 
	 */
	async decrypteJWE(jwe: JWE, options: DecryptJWEResult = {}): Promise<Uint8Array> {
		return new Promise(async (resolve, reject) => {
		try {
				if (this._id == null) reject('DID not authenticated');
				const { payload } = await this.did_decryptJWE(this.edKey.secretKey, options);
				resolve(decodeBase64(payload))
			} catch (error) {
				reject(error)
			}
		});
}

	/**
	 * DID authetication method
	 * @param did 
	 * @param secretKey 
	 * @param params 
	 * @returns 
	 */
	async did_authenticate(did: string, secretKey: Uint8Array, params: AuthParams) {
		const response = await this.sign({ did, aud: params.aud, nonce: params.nonce, paths: params.paths, exp: Math.floor(Date.now() / 1000) + 60000 }, did, secretKey)
		return await this.toGeneralJWS(response);
	}

	/**
	 * 
	 * @param param0 
	 * @param params 
	 * @returns 
	 */
	async did_createJWS(params: CreateJWSParams): Promise<GeneralJWS> {
		return new Promise<GeneralJWS>(async (resolve, reject) => {
			const requestDid = params.did.split('#')[0]
			if (requestDid != this._id) reject('DID Invalid');
			const jws = await this.sign(params.payload, this._id, this.edKey.secretKey, params.protected)
			return { jws: this.toGeneralJWS(jws) }
		})
	}

	/**
	 * 
	 * @param param0 
	 * @param params 
	 * @returns 
	 */
	async did_decryptJWE({ secretKey }, params: DecryptJWEParams) {
		const decrypter = x25519Decrypter(convertSecretKeyToX25519(secretKey))
		try {
			const bytes = await decryptJWE(params.jwe, decrypter)
			return { payload: u8a.toString(bytes, B64) }
		} catch (e) {
			throw new Error(e.message)
		}
	}

	storeJWE(db,jwe: JWE) {

	}
	signJWE(jwe: JWE) {
		throw new Error('Method not implemented.')
	}
	verifyJWE(jwe: JWE) {
		throw new Error('Method not implemented.')
	}
	blsSignature(seed) {
		const bls = new BLS();
	}
	issue() {
		throw new Error('Method not implemented.')
	}
	verifySignature(signature: any) {
		throw new Error('Method not implemented.')
	}
	proof() {
		throw new Error('Method not implemented.')
	}
	verifyProof() {
		throw new Error('Method not implemented.')
	}
	generateSuite() {
		throw new Error('Method not implemented.')
	}
	issueVerifiableCredentials(suite: any, documentloader: any) {
		
	}

	sync() {
		throw new Error('Method not implemented.')
	}


	toGeneralJWS(jws: string): GeneralJWS {
		const [protectedHeader, payload, signature] = jws.split('.')
		return {
			payload,
			signatures: [{ protected: protectedHeader, signature }],
		}
	}

}