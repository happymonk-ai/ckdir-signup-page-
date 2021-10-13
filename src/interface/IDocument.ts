import { DID } from 'dids';
import IProof from './IProof'

type Ceveat = [
    {
        type: string;
        uri: string;
    }
];

export interface IDocument extends Record<string,any> {
	
    id:string // nanoid of the current document
    did:string // did of the document
    ckdrdid:string // Chokidr DocumentManager Controller DID 
	peerdid:string // Signer Peer DID
    type:string; // Document Type described in w3 formats
    odid:string; // organisation DID if any
    
    signature?:string; // Document Signature
    controller?:string; // Controller // EDPubKey in base58 format
    created_at?:string; // timestamp of the time the document was created
    updated_at?:string // timestamp of the last document value updated
    previousLink?:string; // PreviousLink of the document

    parentCapability:string // Capability Chain
    action:string
    ceveat?:Ceveat

	_content?: {}; // Document Block IBLock Format
	payload?:string;  // payload If any



	proof?:[IProof]
}



