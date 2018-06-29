// Import Local Dependencies
const { capitalizeFirstLetter,  validateEmail } = require('../utils/index');
const { MySQL }  =  require('../db/mysql');

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
 * POST -> Store Students By Teacher
 * 
 * Request Body (Teacher Email Address & Array - Student Email IDs) - JSON(application/json)
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param Type <?> - response (Send back the desired HTTP response)
 * @return Status Code - HTTP Code 204
 */
exports.register = async (request, response) => {

    let teacherEmail  = request.body.teacher;
    let studentEmails = request.body.students;

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

    if (!studentEmails.length) {
        response.status(404);
        response.send({"success": false, "message": "Student Email(s) Address - Empty []"});
        return;
    }

    let studentPayload = "";
    if (studentEmails.length > 0) {
        for (idx in studentEmails) {
            if (!validateEmail(studentEmails[idx])) {
                response.status(404);
                response.send({"success": false, "message": "Student Email Address - Validation Failed!"});
                return;
            }
            let studentName  = capitalizeFirstLetter(studentEmails[idx].split('@')[0]);
            let studentEmail = studentEmails[idx];
            let eachStudentDetail = '("' + studentName + '","' + studentEmail + '")';
            if (parseInt(studentEmails.length - 1) === parseInt(idx)) {
                studentPayload += eachStudentDetail;
                break;
            }
            studentPayload += eachStudentDetail + ',';
        }
    }

    let connectionPool = MySQL.connect(_MySQL_DB_HostName, _MySQL_DB_UserName, 
                                         _MySQL_DB_Password, _MySQL_DB_DatabaseName);


    let teacherName = capitalizeFirstLetter(teacherEmail.split('@')[0]);
    let teacherPayload = { "name": teacherName, "email": teacherEmail };
    let teacherExist = await MySQL.insert(connectionPool, _MySQL_DB_Teachers_TableName, teacherPayload);

    if (teacherExist) {
        response.status(404);
        response.send({"success": false, "message": "Teacher Email Address - Already Exists!"});
        return;
    }

    await MySQL.insertIgnore(connectionPool, _MySQL_DB_Students_TableName, studentPayload);
                             
    let studentTeacherPayload = "";
    if (studentEmails.length > 0) {
        for (idx in studentEmails) { 
            let studentEmail = studentEmails[idx];
            let eachStudentTeacherDetail = '("' + teacherEmail + '","' + studentEmail + '","' + _Is_Suspended_Default_Value +  '")';
            if (parseInt(studentEmails.length - 1) === parseInt(idx)) {
                studentTeacherPayload += eachStudentTeacherDetail;
                break;
            }
            studentTeacherPayload += eachStudentTeacherDetail + ',';
        }
    }

    let queryStatement = `INSERT INTO ${ _MySQL_DB_TS_TableName } VALUES ${ studentTeacherPayload }`;
    await MySQL.nativeQuery(connectionPool, queryStatement);
    response.status(204);
    response.send();
};