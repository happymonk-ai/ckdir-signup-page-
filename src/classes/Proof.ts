import { Field, ObjectType } from 'type-graphql';
import IProof from "../interface/IProof";

/**
 * Proof Defination
 */

@ObjectType({ description: "Proof Format Document" })
export class Proof implements IProof {
    @Field()
    type: string;
    @Field()
    created: string;
    @Field()
    verificationMethods: string;
    @Field()
    proofPurpose: string;
    @Field()
    proofValue: string;
    @Field()
    nonce: string;
}
