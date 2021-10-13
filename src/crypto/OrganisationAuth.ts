import { DID } from 'dids';
import { JWE } from 'did-jwt';




/**
 * Organisation Authentication for the node
 */
export class OrganisationAuth {

	organisationDIDList: Map<string, DID>;
	activeOrganisationCount: number = 0;

	constructor() {
		this.organisationDIDList = new Map<string, DID>();
		this.activeOrganisationCount = 0;
	}

	addOrganisationDID(did: DID) {
		this.organisationDIDList.set(did.id, did);
		this.activeOrganisationCount = this.organisationDIDList.size;
		this.sync();
	}
	removeOrganisationDID(did: string) {
		this.organisationDIDList.delete(did);
		this.activeOrganisationCount = this.organisationDIDList.size;
		this.sync();
	}

	// class used to sign all data for the respective admins and dids of the organisation
	async sign(organisationdid: string, dids?: string[], payload?: any) {
		const did: DID = this.organisationDIDList.get(organisationdid);
		const jwe = await did.createDagJWE(payload, dids);
		const { jws } = await did.createDagJWS(jwe);
		did.verifyJWS(jws);
		return { jwe, jws };
	}

	async decode(organisationdid: string, jwe?: JWE) {
		const did: DID = this.organisationDIDList.get(organisationdid);
		const value = await did.decryptDagJWE(jwe);
		this.sync();
		return value;
	}

	sync() {
		// sync the data with the other nodes in the system
	}
}
