import {CLI, Command} from 'cliffy';
import * as si from 'systeminformation'
import server from '../server/server';

const Ora = require('ora');

 

const spinner = new Ora({
	discardStdin: false,
	text: 'Loading Chokidr, not discarding stdin',
	spinner: process.argv[2]
});

const spinnerDiscardingStdin = new Ora({
	text: 'Loading Chokidr',
	spinner: process.argv[2]
});


const systemInformation: Command = {
    description:'Get the current System Information',
    parameters:['type'],
    action(params, options){
        switch(params.options){
            case 'all':
                console.log('Generating System information');
                si.getAllData().then(data =>console.log(data));
                break;
            default:
                throw new Error('Undefined Option. Please type help for option list');
        }

    },
    subcommands:{
        system:{
            description:'Get the system information',
            parameters:['all','system'],
            action: async (params)=> {
                if(params.all)
                console.log('Fetching System Information....');
                console.log('This might take a while, depending on the system that you are in');
                console.log('System Information');
                await si.getAllData().then(data =>console.log(data));
            }
        }
    }
}


const add :Command = {
    description:'Add a member organistion fleet device to the system',
    action(){
        subcommands:{
            
        }
    }
}
const startCli = async (options?:any)=>{
    const cli = new CLI();
    // const version = server.version;
    spinner.start();
    setTimeout(()=>{
        spinner.succeed();
    },4000)
    cli.setVersion("0.1").setName('chokidr').setDelimiter("ckdr@happymonk(-.-):").setInfo(`

    🧵🧵🧵🧵🧵🧵🧵🧵🧵🧵🧵🧵🧵🧵

    ☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️☢️
    Chokidr CommandLine Panel.
    ---------..------------------------..------------------------..------------------------..------------------------..------------------------..---------------
    CHOKIDRNODE Version 0.0.1
    ---------..------------------------..------------------------..------------------------..------------------------..------------------------..---------------
    Node Information:
    Version : 
    Getting Node DID
    PeerID:did:key:z6MkqvdGBinpPgDCFttHTPvCwtwrXxip2UnUpSXAXtExDEqf:SA:41134518hf98q981hbr819rn89r908fnc72ehbcqbd91b98bu12u0421y4h
    Time: ${Date.now()}
    LastUpdatetime: ${Date.now()}
    LastDowntime: 
    No of peers Connected: 3 
    `)
    .addCommands({
        add:{
            description:"",
            parameters:[{label:'type',description:'add a type of user'}],
            options:[],
            action(params,options){
            console.log('Add Being Called');
        }},
        update:{action(params,options){
            console.log('Update called');
        }},
        create:{action(params,options){
            console.log('Create called');
        }},
        exit:{action(params,options){
            process.exit(0);
        }},
        info:systemInformation,
        connect:{action(params,options){
            
        }}
    }).show();
    
}
