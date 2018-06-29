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
 * GET -> Common Students - Single Teacher / Two Teacher(s)
 *
 * @param (Query) teacher - Teacher Email Address(s)
 * @return array - Student Email ID(s)
 */
exports.common_students = async (request, response) => {

    let teacherEmails = request.query.teacher;
    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                        _MySQL_DB_Password, _MySQL_DB_DatabaseName);

    let isSingleTeacher = false;
    let emailValidationFailed = false;

    let teacherPayload = "";
    if (teacherEmails instanceof Array) {
        for (idx in teacherEmails) {
            if (!validateEmail(teacherEmails[idx])) {
                emailValidationFailed = true;
                break;
            }
            if (parseInt(teacherEmails.length - 1) === parseInt(idx)) {
                teacherPayload += "'" + teacherEmails[idx] + "'";
                break;
            }
            teacherPayload += "'" + teacherEmails[idx] + "',";
        }
    } else {
        if (!validateEmail(teacherEmails)) emailValidationFailed = true;
        isSingleTeacher = true;
        teacherPayload += "'" + teacherEmails + "'";
    }

    if (emailValidationFailed) {
        response.status(404);
        response.send({"success": false, "message": "Teacher Email Address - Validation Failed!"});
        return;
    }

    let queryStatement = `SELECT TS.student_email FROM ${ _MySQL_DB_Students_TableName } S `   +
                         `INNER JOIN ${ _MySQL_DB_TS_TableName } TS ON TS.student_email = S.email `      +
                         `INNER JOIN ${ _MySQL_DB_Teachers_TableName } T ON T.email = TS.teacher_email ` +
                         `WHERE TS.teacher_email IN (${ teacherPayload })`;

    let result = await MySQL.nativeQuery(connectionPool, queryStatement);

    let studentEmails = [];
    if (result instanceof Array) {
        for(idx in result) {
            studentEmails.push(result[idx].student_email);
        }
    }

    if (isSingleTeacher) {
        response.send({"students": studentEmails});
        return;
    } 

    let unique = studentEmails
        .map((studentEmail) => {
            return {count: 1, name: studentEmail};
        })
        .reduce((object, studentObject) => {
            object[studentObject.name] = (object[studentObject.name] || 0) + studentObject.count;
            return object;
        }, {});

    let commonStudents = Object.keys(unique).filter((object) => unique[object] > 1);
    response.send({"students": commonStudents});
};