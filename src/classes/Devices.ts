import {
  Field,
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
import { IDevice } from "../interface/IDevice";
import { nanoid } from "nanoid";

/**
 *
 */
@ObjectType({ description: "Device class definations" })
export class Device {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  did: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  location: string;

  @Field({ nullable: true })
  image: string;

  constructor(){
      this.id = nanoid(24)
  }
}

