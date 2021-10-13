import {
  Field,
  ID,
  ObjectType,
  Int,
  Float,
  Resolver,
  Query,
  Arg,
  InputType,
  InputTypeOptions,
  Subscription,
  Mutation,
} from "type-graphql";
import { nanoid } from "nanoid";
import { IDocument } from "../interface/IDocument";
import { Block } from "./Block";
import { Proof } from "./Proof";

/**
 *
 */
@ObjectType({ description: "Document Defination when creating a new Document" })
export class Document implements IDocument {
  @Field((type) => ID)
  id: string;

  @Field()
  did: string;

  @Field({ nullable: true })
  graph: [Block];
  
  @Field()
  proof: [Proof];

  @Field({ nullable: true })
  ckdrdid: string;

  @Field({ nullable: true })
  peerdid: string;
  
  @Field({ nullable: true })
  type: string;
  
  @Field({ nullable: true })
  odid: string;
  
  @Field({ nullable: true })
  signature?: string;
  
  @Field({ nullable: true })
  controller?: string;
  
  @Field({ nullable: true })
  created_at?: string;
  
  @Field({ nullable: true })
  updated_at?: string;
  
  @Field({ nullable: true })
  previousLink?: string;
  
  @Field({ nullable: true })
  parentCapability: string;
  
  @Field({ nullable: true })
  action: string;
  
  @Field({ nullable: true })
  ceveat?: [{ type: string; uri: string }];
  
  @Field({ nullable: true })
  _content?: {};
  
  @Field({ nullable: true })
  payload?: string;

  constructor(options: IDocument) {
    this.id = nanoid(24);
  }

}
