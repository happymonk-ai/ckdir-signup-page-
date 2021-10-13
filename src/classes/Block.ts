import { JWE } from '../interface/jwe';
import { CID } from 'multiformats';
import { nanoid } from 'nanoid';
import { Field, ID, ObjectType } from 'type-graphql';
import IBlock from '../interface/IBlock';

/**
 * Block Class Defination as per graph query requirement
 */
@ObjectType({ description: "Block Class Defination" })
export class Block implements IBlock {

    @Field(type => ID)
    id: string;
    @Field({ nullable: true })
    sequence?: number;
    @Field({ nullable: true })
    controller?: string | Uint8Array;
    @Field({ nullable: true })
    timestamp?: string;
    @Field({ nullable: true })
    signature?: string | Uint8Array;
    @Field({ nullable: true })
    meta?: { created_at?: string; updated_at?: string; contentType?: string; contentLength?: string; };
    @Field({ nullable: true })
    index?: [{ sequence: number; hmac: { id: string; type: string; }; attributes: [{ name: string; value: string; unique: boolean; }]; }];
    @Field({ nullable: true })
    stream?: { id: string; jwe?: JWE; };
    @Field({ nullable: true })
    previousLink?: string | CID;
    @Field({ nullable: true })
    payload?: any;
    @Field({ nullable: true })
    jwe?: JWE;


    constructor(options: IBlock) {
        this.id = nanoid(24);
    }

}
