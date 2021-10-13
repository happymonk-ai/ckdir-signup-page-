import { Field, ID, ObjectType, Int, InputType} from 'type-graphql';
import Organisation from './Organisation'
import {nanoid} from 'nanoid';
import {DateTime} from 'luxon';
import { MaxLength, Length } from "class-validator";

@InputType()
export class InvitationInput {
  @Field()
  name: string;

  @Field()
  phoneNumber: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  organisationName: string;

  @Field({ nullable: true })
  invitedBy: string;

  @Field({ nullable: true })
  invitedById: string;

  @Field({ nullable: true })
  invitationCode: string;

  @Field({ nullable: true })
  isValid: boolean;
}




@ObjectType({description:'Defination for Invitation Interface'})
export default class Invitation{

    @Field(type=>ID)
    id:string

    @Field({nullable:true,description:"hashLink of the invitation"})
    token:string
    
    @Field(type=>String,{nullable:true,description:'Invitation Created Time'})
    createdTime:string

    @Field({nullable:true})
    createdFor:string

    @Field({nullable:true, description:"DID of the controller that created the invitation"})
    createdBy:string

    @Field(type=>Boolean,{nullable:true})
    userNotified:boolean

    @Field({nullable:true})
    expirationPeriod:string

    @Field(type=>String,{nullable:true})
    nonce:string

    @Field(type=>Organisation,{nullable:true})
    worksFor:Organisation


    constructor(){
        this.id = nanoid(24)
        this.createdTime = DateTime.now().toISO();
        this.expirationPeriod = DateTime.now().plus(100).toISO()
    }

}
