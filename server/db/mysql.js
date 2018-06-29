// Import Libraries Dependencies
const mysql     =  require('promise-mysql');
const log4js    =  require('log4js');

// Logger -> Log4js
const logger = log4js.getLogger();
logger.level = 'debug';

const MySQL = {

    // 1. Connection - MySQL Database
    connect: (hostName, userName, password, databaseName) => {

        const pool = mysql.createPool({
            connectionLimit: 100,
            host: hostName,
            user: userName,
            password: password,
            database: databaseName
        });

        pool.getConnection((error, connection) => {
            if (error) {
                switch(error.code) {
                    case 'PROTOCOL_CONNECTION_LOST': console.error('Database connection was closed.'); break;
                    case 'ER_CON_COUNT_ERROR': console.error('Database connection was closed.'); break;
                    case 'ECONNREFUSED': console.error('Database connection was refused.'); break;
                }
                logger.error('Error # MySQL DB Connection: ', error.stack);
            }
            if (connection) {
                // logger.info('Success! MySQL DB Connection: ' + connection.threadId);  
                connection.release();
            } 
            return;
        });
        return pool;
    },

    // 2. SelectAll - Retrieve all the values from the given table name
    selectAll: async (connection, tableName) => {
        try {
            let results = await connection.query(`SELECT * FROM ${ tableName }`);
            // logger.info('Success! MySQL DB - Select All Query: ', results);
            return results;
        } catch (error) {
            // logger.error('Error # MySQL DB - Select All Query: ', error);
        }
    },

    // 3. SelectOne - Retrieve selected row from the given table name and condition
    selectOne: async (connection, tableName, neededColumnName, searchColumnName, searchColumnValue) => {
        try {
            let queryStatement = `SELECT ${ neededColumnName } ` +  
                                 `FROM ${ tableName } ` + 
                                 `WHERE ${ searchColumnName } IN (${ searchColumnValue })`;
            let results = await connection.query(queryStatement);
            // logger.info('Success! MySQL DB - Select One Query: ', results);
            return results;
        } catch (error) {
            // logger.error('Error # MySQL DB - Select One Query: ', error);
        }
    },

    // 4. Insert - Store all the values in the given table name
    insert: async (connection, tableName, payload) => {
        try {
            await connection.query(`INSERT INTO ${ tableName } SET ?`, payload);
            // logger.info('Success! MySQL DB - Data Inserted!');
            return false;
        } catch (error) {
            // logger.error('Error # MySQL DB - Insert Query: ', error);
            return true;
        }
    },

    // 4. Insert Ignore - Store all the values in the given table name (Skip Primary Key Validation)
    insertIgnore: async (connection, tableName, payload) => {
        try {
            let queryStatement = `INSERT IGNORE INTO ${ tableName } VALUES ${ payload }`;
            await connection.query(queryStatement);
            // logger.info('Success! MySQL DB - Data Inserted!');
            return false;
        } catch (error) {
            // logger.error('Error # MySQL DB - Insert Ignore Query: ', error);
            return true;
        }
    },

    // 5. Update - Replace the new values for the corresponding row
    update: async (connection, tableName, columnOne, valueOne, updateColumnName, updateColumnValue) => {

        try {
            let queryStatement = `UPDATE ${ tableName } 
                                  SET ${ columnOne } = '${ valueOne }'
                                  WHERE ${ updateColumnName } = '${ updateColumnValue }'`;

            let results = await connection.query(queryStatement);
            logger.info('Success! MySQL DB - Data Updated!');
        } catch (error) {
            // logger.error('Error # MySQL DB - Update Query: ', error);
            return error;
        }
    },

    // 6. Native Query - Replace the queryStatement using the raw query for execution
    nativeQuery: async(connection, queryStatement) => {
        try {
            let results = await connection.query(queryStatement);
            // logger.info('Success! MySQL DB - Native Query Executed!');
            return results;
        } catch (error) {
            // logger.error('Error # MySQL DB - Native Query: ', error);
            return error;
        }
    }
};

module.exports = { MySQL };
