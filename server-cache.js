/*
 Example EWD.js Startup file for use with Cache on Windows

 Notes:

 1) Change the database.path value as appropriate for your Cache installation.  Also change the
 password etc if required

 2) IMPORTANT!: The cache.node interface module file MUST exist in the primary node_modules directory
 of your EWD.js configuration

 */

var ewdjs = require('ewdjs');

var defaults = {
    port: 8088,
    poolsize: 2,
    tracelevel: 3,
    password: '123',
    ssl: false,
    database: {
        type: 'cache',
        path:"C:\\InterSystems\\Cache\\mgr",
        nodePath: "D:\\vista-boilerplate\\node_modules\\cache",
        username: "Admin",
        password: "admin",
        namespace: "SYS"
    },
    rootPath: 'D:\\vista-boilerplate\\build'
};

var params = {
    httpPort: defaults.port,
    poolSize: defaults.poolsize,
    database: defaults.database,
    https: {
        enabled: defaults.ssl
    },
    traceLevel: defaults.tracelevel,
    management: {
        password: defaults.password
    }
};

setTimeout(function() {
    ewdjs.start(params);
},1000);