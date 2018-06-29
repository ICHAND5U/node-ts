// Import Local Dependencies
const { MySQL }  =  require('../db/mysql');
const { validateEmail } = require('../utils/index');

// Register -> Configuration(s)
const config  =  require('../config/config');

// Register -> Environment Variable(s)
const _MySQL_DB_HostName             =  process.env.MYSQL_DB_HOSTNAME;
const _MySQL_DB_UserName             =  process.env.MYSQL_DB_USERNAME;
const _MySQL_DB_Password             =  process.env.MYSQL_DB_PASSWORD;
const _MySQL_DB_DatabaseName         =  process.env.MYSQL_DB_DATABASE_NAME;
const _MySQL_DB_Teachers_TableName   =  process.env.MYSQL_DB_TABLE_TEACHERS;
const _MySQL_DB_Students_TableName   =  process.env.MYSQL_DB_TABLE_STUDENTS;
const _MySQL_DB_TS_TableName         =  process.env.MYSQL_DB_TABLE_TEACHERS_STUDENTS;
const _MySQL_DB_Name_ColName         =  process.env.MYSQL_DB_COLUMN_NAME;
const _MySQL_DB_Email_ColName        =  process.env.MYSQL_DB_COLUMN_EMAIL;
const _MySQL_DB_TeacherEmail_ColName =  process.env.MYSQL_DB_COLUMN_TEACHER_EMAIL;
const _MySQL_DB_StudentEmail_ColName =  process.env.MYSQL_DB_COLUMN_STUDENT_EMAIL;
const _MySQL_DB_Is_Suspended_ColName =  process.env.MYSQL_DB_COLUMN_IS_SUSPENDED;
const _Is_Suspended_Default_Value    =  process.env.IS_SUSPENDED_DEFAULT_VALUE;

/** 
 * POST -> Receive Notification - Students Email IDs
 * 
 * Request Body (Teacher Email Address & Notification Message) - JSON(application/json)
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param Type <?> - response (Send back the desired HTTP response)
 * @return array - Student Email ID(s)
 */
exports.retrieve_notifications = async (request, response) => {

    let teacherEmail = request.body.teacher;
    let notification = request.body.notification;

    if (!teacherEmail) {
        response.status(404);
        response.send({"success": false, "message": "Teacher Email Address - Not Available!"});
        return;
    }

    if (!validateEmail(teacherEmail)) {
        response.status(404);
        response.send({"success": false, "message": "Teacher Email Address - Validation Failed!"});
        return;
    }

    if (!notification) {
        response.status(404);
        response.send({"success": false, "message": "Notification - Not Available!"});
        return;
    }

    let myMessageArray = notification.split(" ");
    let notificationEmailIDs = [];

    myMessageArray.forEach((value, index) => {    
        if (value.indexOf('@') === 0) {
            notificationEmailIDs.push(value.slice(1));
        }
    });

    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);
    
    let teacherData = await MySQL.selectOne(connectionPool, _MySQL_DB_Teachers_TableName, _MySQL_DB_Email_ColName, 
                                                             _MySQL_DB_Email_ColName, "'" + teacherEmail + "'");

    if(!teacherData || teacherData.length === 0) {
        response.status(404);
        response.send({"success": false, "message": "Teacher Email Address - Not Present In Database"});
        return;
    }

    let queryStatement = `SELECT TS.student_email FROM ${ _MySQL_DB_Students_TableName } S `   +
                         `INNER JOIN ${ _MySQL_DB_TS_TableName } TS ON TS.student_email = S.email `      +
                         `INNER JOIN ${ _MySQL_DB_Teachers_TableName } T ON T.email = TS.teacher_email ` +
                         `WHERE TS.teacher_email = '${ teacherEmail }' AND TS.is_suspended = ${ _Is_Suspended_Default_Value } `;

    let notSuspendedList = await MySQL.nativeQuery(connectionPool, queryStatement);

    let notificationEmailsList = [];
    for (idx in notSuspendedList) {
        notificationEmailsList.push(notSuspendedList[idx].student_email);
    }

    notificationEmailsList.push(...notificationEmailIDs);
    response.send({"recipients": notificationEmailsList});
};