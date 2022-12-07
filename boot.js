const {startApi} = require('./api');
const {startWorker} = require('./worker');

let server = startApi();
let ival   = startWorker();

setTimeout(function (){
    server.close();
    clearInterval(ival);
}, 600000)