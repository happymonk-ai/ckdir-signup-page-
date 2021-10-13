import os from 'os';
import fs from 'fs';
import cluster, {ClusterSettings} from 'cluster';
import { loadConfig } from 'config';

const config = loadConfig();

const clusterSettings:ClusterSettings = {

}



export default class Cluster{
    constructor(){
        if(cluster.isPrimary){
            process.title = '[CKDR][PROCESS] Master'
            setInterval(this.write,5000);
            this.fork();
        }
    }

    write(){
        fs.writeFile(`${__dirname}/data/master.mem`, Date.now()
            +' '+ JSON.stringify(process.memoryUsage()) +'\n', { flag: 'a' }, () => {})

        fs.writeFile(`${__dirname}/data/master.cpu`, Date.now()
            +' '+ JSON.stringify(os.loadavg()) +'\n', { flag: 'a' }, () => {})
    }


    fork(){
        let cpus = os.cpus().length

        for(let i = 0; i < cpus; i++){
            cluster.setupPrimary({
                exec: __dirname + '/worker.ts'
            });
            cluster.fork({id:i})
        }
    }
}