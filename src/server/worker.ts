import fs from 'fs';
import { DateTime } from 'luxon';
import { main } from './start';

export class Worker{
    id: string;
    hit = 0


    constructor(){
        this.id = process.env.id
        process.title = '[CKDR][WORKER]'+ this.id
        this.server
    }
    write () {
        fs.writeFile(`${__dirname}/data/worker${this.id}.hit`, this.hit + "", () => {})
        fs.writeFile(`${__dirname}/data/worker${this.id}.mem`, DateTime.now()
            +' '+ JSON.stringify(process.memoryUsage())
            +'\n', { flag: 'a' }, () => {})
    }

    server(){
        // start the server over here
        main()

    }
}

new Worker()