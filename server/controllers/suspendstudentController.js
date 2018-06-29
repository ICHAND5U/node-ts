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

/** 
 * POST -> Suspend Student
 * 
 * Request Body (Teacher Email Address & Student Email Address) - JSON(application/json)
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param Type <?> - response (Send back the desired HTTP response)
 * @return Status Code - HTTP Code 204
 */
exports.suspend_students = async (request, response) => {

    let teacherEmail = request.body.teacher;
    let studentEmails = request.body.student;
    let isMultipleStudents = false;

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

    if (studentEmails instanceof Array && !studentEmails.length) {
        response.status(404);
        response.send({"success": false, "message": "Student Email(s) Address - Empty []"});
        return;
    }

    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);

    let suspendPayload = "";
    if (studentEmails instanceof Array && studentEmails.length > 0) {
        isMultipleStudents = true;
        for (idx in studentEmails) {
            if (!validateEmail(studentEmails[idx])) {
                response.status(404);
                response.send({"success": false, "message": "Student Email Address - Validation Failed!"});
                return;
            }
            if (parseInt(studentEmails.length - 1) === parseInt(idx)) {
                suspendPayload += "'" + studentEmails[idx] + "'";
                break;
            }
            suspendPayload += "'" + studentEmails[idx] + "',";
        }

        console.log(suspendPayload);

        let studentsData = await MySQL.selectOne(connectionPool, _MySQL_DB_Students_TableName, _MySQL_DB_Email_ColName, 
                                                                 _MySQL_DB_Email_ColName, suspendPayload);
        if (studentsData.length !== studentEmails.length) {
            response.status(404);
            response.send({"success": false, "message": "Student Email(s) Address - Not Present In Database"});
            return;
        }
    }    
    
    let teacherData = await MySQL.selectOne(connectionPool, _MySQL_DB_Teachers_TableName, _MySQL_DB_Email_ColName, 
                                             _MySQL_DB_Email_ColName, "'" + teacherEmail + "'");
    if(!teacherData || !teacherData.length) {
        response.status(404);
        response.send({"success": false, "message": "Teacher Email Address - Not Present In Database"});
        return;
    }
                                             
    if (!isMultipleStudents) {
        suspendPayload += "'" + studentEmails + "'";
        let studentData = await MySQL.selectOne(connectionPool, _MySQL_DB_Students_TableName, _MySQL_DB_Email_ColName, 
                                                                 _MySQL_DB_Email_ColName, suspendPayload);
        if(!studentData || !studentData.length) {
            response.status(404);
            response.send({"success": false, "message": "Student Email Address - Not Present In Database"});
            return;
        }
    }

    let queryStatement = `UPDATE ${ _MySQL_DB_TS_TableName } SET ${ _MySQL_DB_Is_Suspended_ColName } = 0 ` +
                         `WHERE ${ _MySQL_DB_TeacherEmail_ColName } = '${ teacherEmail }' ` +
                         `AND ${ _MySQL_DB_StudentEmail_ColName } IN (${ suspendPayload })`;

    await MySQL.nativeQuery(connectionPool, queryStatement); 
    response.status(204);
    response.send();
};