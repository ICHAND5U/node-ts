// Import Libraries Dependencies
const express      =  require('express');
const log4js       =  require('log4js');
const bodyParser   =  require('body-parser');

// Import Routes Dependencies
const indexRouter   =  require('./routes/index');
const schoolRouter  =  require('./routes/school');

// Register -> Configuration(s)
const config  =  require('./config/config');

// Register -> Environment Variable
const _EXPRESS_Port  =  process.env.EXPRESS_PORT;

// Logger -> Log4js
const logger = log4js.getLogger();
logger.level = 'debug';

const port = _EXPRESS_Port;
const app  = express();

app.use(bodyParser.urlencoded({ extended: false })); // Configuration Express -> Use body-parser as middleware
app.use(bodyParser.json()); // Body Parser -> Use JSON Data
app.use('/', indexRouter);
app.use('/api', schoolRouter); // Add school routes to middleware chain.

/**
 * LISTEN -> Listening To The App Server Via Port
 *
 * @param port - Number Port
 */
app.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});

module.exports = { app };