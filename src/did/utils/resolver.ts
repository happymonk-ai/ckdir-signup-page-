
import multibase from 'multibase'
const { convertPublicKeyToX25519 } = require('@stablelib/ed25519');
import * as u8a from 'uint8arrays'

const DID_LD_JSON = 'application/did+ld+json'
const DID_JSON = 'application/did+json'


const Resolver = async ()=>{
    const getResolver = () => ({
        'key': async (did, parsed, r, options) => {
            const contentType = options.accept || DID_JSON
            const response = {
                didResolutionMetadata: { contentType },
                didDocument: null,
                didDocumentMetadata: {}
            }
            try {
                const multicodecPubKey = multibase.decode(parsed.id)
                const keyType = varint.decode(multicodecPubKey)
                const pubKeyBytes = multicodecPubKey.slice(varint.decode.bytes)
                const doc = await keyToDidDoc(pubKeyBytes, parsed.id)
                if (contentType === DID_LD_JSON) {
                    doc['@context'] = 'https://w3id.org/did/v1',
                        response.didDocument = doc
                } else if (contentType === DID_JSON) {
                    response.didDocument = doc
                } else {
                    delete response.didResolutionMetadata.contentType
                    response.didResolutionMetadata.error = 'representationNotSupported'
                }
            } catch (e) {
                response.didResolutionMetadata.error = 'invalidDid'
                response.didResolutionMetadata.message = e.toString()
            }
            return response
        }
    })
    
    
    const keyToDidDoc = async (pubKeyBytes, fingerprint) => {
        const did = `did:key:${fingerprint}`
        const keyId = `${did}#${fingerprint}`
        const x25519PubBytes = convertPublicKeyToX25519(pubKeyBytes)
        const x25519KeyId = `${did}#${encodeKey(x25519PubBytes)}`
        return {
            id: did,
            verificationMethod: [{
                id: keyId,
                type: 'Ed25519VerificationKey2018',
                controller: did,
                publicKeyBase58: u8a.toString(pubKeyBytes, 'base58btc'),
            },],
            authentication: [keyId],
            assertionMethod: [keyId],
            capabilityDelegation: [keyId],
            capabilityInvocation: [keyId],
            keyAgreement: [{
                id: x25519KeyId,
                type: 'X25519KeyAgreementKey2019',
                controller: did,
                publicKeyBase58: u8a.toString(x25519PubBytes, 'base58btc'),
            }]
        }
    }
}


export default Resolver