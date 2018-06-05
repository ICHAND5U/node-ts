// Import Libraries Dependencies
const express      =  require('express');
const log4js       =  require('log4js');
const _            =  require('lodash');
const bodyParser   =  require('body-parser');

// Register -> Configuration(s)
const config  =  require('./config/config');

// Import Local Dependencies
const { MySQL }  =  require('./db/mysql');

// Logger -> Log4js
const logger = log4js.getLogger();
logger.level = 'debug';

// Register -> Environment Variable(s)
const _EXPRESS_Port             =   process.env.EXPRESS_PORT;
const _MySQL_DB_HostName        =   process.env.MYSQL_DB_HOSTNAME;
const _MySQL_DB_UserName        =   process.env.MYSQL_DB_USERNAME;
const _MySQL_DB_Password        =   process.env.MYSQL_DB_PASSWORD;
const _MySQL_DB_DatabaseName    =   process.env.MYSQL_DB_DATABASE_NAME;
const _MySQL_DB_TableName       =   process.env.MYSQL_DB_TABLE_NAME;
const _MySQL_DB_TeacherColName  =   process.env.MYSQL_DB_TEACHER_COL_NAME;
const _MySQL_DB_StudentColName  =   process.env.MYSQL_DB_STUDENT_COL_NAME;

const port = _EXPRESS_Port;
const app  = express();

app.use(bodyParser.urlencoded({ extended: false })); // Configuration Express -> Use body-parser as middleware
app.use(bodyParser.json()); // Body Parser -> Use JSON Data

/** 
 * POST -> Store Students By Teacher
 * 
 * Request Body (Teacher Email Address & Array - Student Email IDs) - JSON(application/json)
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param Type <?> - response (Send back the desired HTTP response)
 * @return Status Code - HTTP Code 204
 */
app.post('/api/register', async (request, response) => {
    let teacherEmail  = request.body.teacher;
    let studentEmails = request.body.students;
    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);
    let result = await MySQL.selectOne(connectionPool, _MySQL_DB_TableName, _MySQL_DB_StudentColName, 
                                                        _MySQL_DB_TeacherColName, teacherEmail);
    if (result) {

        // Existing Values + New Values (All must be unique) -> Update it
        let oldStudents       =  JSON.parse(result.StudentEmails);
        let newStudents       =  studentEmails;
        let combinedStudents  =  oldStudents.concat(newStudents);
        let uniqueStudents    =  JSON.stringify(_.uniq(combinedStudents));

        // Update the row
        await MySQL.update(connectionPool, _MySQL_DB_TableName, 
                                  _MySQL_DB_StudentColName, uniqueStudents, 
                                  _MySQL_DB_TeacherColName, teacherEmail);
    } else {
        // Insert a new row
        await MySQL.insert(connectionPool, _MySQL_DB_TableName, teacherEmail, studentEmails);
    }
    response.status(204);
    response.send();
});

/** 
 * GET -> Common Students - Single Teacher / Two Teacher(s)
 *
 * @param (Query) teacher - Teacher Email Address(s)
 * @return array - Student Email ID(s)
 */
app.get('/api/commonstudents', async (request, response) => {

    let teacherEmail = request.query.teacher;
    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);
    if (teacherEmail instanceof Array) {

        // Two Teachers
        let firstTeacherEmail  = teacherEmail[0];
        let secondTeacherEmail = teacherEmail[1];

        let firstTData = await MySQL.selectOne(connectionPool, _MySQL_DB_TableName, _MySQL_DB_StudentColName, 
                                                                _MySQL_DB_TeacherColName, firstTeacherEmail);
        let firstTStudents = JSON.parse(firstTData.StudentEmails);  
        
        let secondTData = await MySQL.selectOne(connectionPool, _MySQL_DB_TableName, _MySQL_DB_StudentColName, 
                                                                  _MySQL_DB_TeacherColName, secondTeacherEmail);
        let secondTStudents = JSON.parse(secondTData.StudentEmails);  
        let commonStudents  = _.intersection(firstTStudents, secondTStudents);
        response.send({"students": commonStudents});
    } else {
        
        // Single Teacher
        let data = await MySQL.selectOne(connectionPool, _MySQL_DB_TableName, _MySQL_DB_StudentColName, 
                                                          _MySQL_DB_TeacherColName, teacherEmail);
        if (data) {
            response.send({"students": JSON.parse(data.StudentEmails)});
        } else {
            response.send({"message": "Teacher Email Address - Invalid!"});
        }                                               
    }
});

/** 
 * POST -> Suspend Student
 * 
 * Request Body (Teacher Email Address & Student Email Address) - JSON(application/json)
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param Type <?> - response (Send back the desired HTTP response)
 * @return Status Code - HTTP Code 204
 */
app.post('/api/suspend', async (request, response) => {

    let teacherEmail = request.body.teacher;
    let studentEmail = request.body.student;
    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);
    let data = await MySQL.selectOne(connectionPool, _MySQL_DB_TableName, _MySQL_DB_StudentColName, 
                                                      _MySQL_DB_TeacherColName, teacherEmail);
    if (data) {
        let students = JSON.parse(data.StudentEmails);
        let index = students.indexOf(studentEmail);
        if (index > -1) {
            students.splice(index, 1);
        } else {
            response.send({"message": "Student is already suspended! (or) Student Email ID - Invalid!"});
        }
        // Update the row
        let result = await MySQL.update(connectionPool, _MySQL_DB_TableName, 
                                            _MySQL_DB_StudentColName, JSON.stringify(students), 
                                             _MySQL_DB_TeacherColName, teacherEmail);
        response.status(204);
        response.send();
    } else {
        response.send({"message": "Teacher Email ID (or) Student Email ID - Invalid!"});
    }
});

/** 
 * POST -> Receive Notification - Students Email IDs
 * 
 * Request Body (Teacher Email Address & Notification Message) - JSON(application/json)
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param Type <?> - response (Send back the desired HTTP response)
 * @return array - Student Email ID(s)
 */
app.post('/api/retrievefornotifications', async (request, response) => {

    let teacherEmail = request.body.teacher;
    let notification = request.body.notification;
    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);
    let myArray = notification.split(" ");
    let notificationEmailIDs = [];

    myArray.forEach((value, index) => {    
        if (value.indexOf('@') === 0) {
            notificationEmailIDs.push(value.slice(1));
        }
    });

    let data = await MySQL.selectOne(connectionPool, _MySQL_DB_TableName, _MySQL_DB_StudentColName, 
                                                      _MySQL_DB_TeacherColName, teacherEmail);
    if (data) {
        let existingStudentEmailIDs  =  JSON.parse(data.StudentEmails);                                            
        let combinedStudentEmailIDs  =  notificationEmailIDs.concat(existingStudentEmailIDs);
        let uniqueStudentEmailIDs    =  _.uniq(combinedStudentEmailIDs);
        response.send({"recipients": uniqueStudentEmailIDs});
    } else {
        response.send({"recipients": notificationEmailIDs});
    }
});

/**
 * GET -> Index Page
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param / @return  Type <?> - response (Send back the desired HTTP response)
 */
app.get('/', (request, response) => {
    response.send({'status': 'Server Is Running!', 'statusCode': 200})
});

/**
 * LISTEN -> Listening To The App Server Via Port
 *
 * @param port - Number Port
 */
app.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});

module.exports = { app };