let env = process.env.NODE_ENV || 'development';

console.log('Environment:', env);

if(env === 'production' || env === 'development' || env === 'test') {

    let config = require('./config.json');
    let envconfig = config[env];

    Object.keys(envconfig).forEach((key) => {
        process.env[key] = envconfig[key];
    });
}