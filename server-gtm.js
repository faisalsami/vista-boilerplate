/*
 Example EWD.js Startup file for use with GT.M running on Linux

 */

var config = {};
if (process.argv[2]) config = require(process.argv[2]);
var ewdjs = require('ewdjs');

var defaults = {
    port: 8088,
    poolsize: 2,
    tracelevel: 3,
    password: '123',
    ssl: false,
    database: 'gtm',
    rootPath: '/home/faisal/vista-boilerplate/build'
};

if (config.setParams) {
    var overrides = config.setParams();
    for (var name in overrides) {
        defaults[name] = overrides[name];
    }
}

var params = {
    httpPort: defaults.port,
    poolSize: defaults.poolsize,
    database: {
        type: defaults.database
    },
    https: {
        enabled: defaults.ssl
    },
    traceLevel: defaults.tracelevel,
    management: {
        password: defaults.password
    },
    webServerRootPath: defaults.rootPath
};

setTimeout(function() {
    ewdjs.start(params);
},1000);