import http from 'http'


const healthCheckOptions  = {
    timeout:3000,
    host:'0.0.0.0',
    port:4000,
    path:'/live'
}


const request = http.request(healthCheckOptions,res=>{
    console.info('STATUS:',res.statusCode);
    process.exitCode = res.statusCode ===200?0:1
    process.exit()
});

request.on('error', err=>{
    console.error('ERROR',err);
    process.exit(1)
});

request.end();