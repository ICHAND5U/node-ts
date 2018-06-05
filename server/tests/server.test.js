// Import Libraries Dependencies
const expect   =  require('expect');
const request  =  require('supertest');
const assert   =  require('assert');

// Import Local Dependencies
const { app }     =  require('./../server');
const { MySQL }   =  require('./../db/mysql');

// Register -> Environment Variable(s)
const _MySQL_DB_HostName        =   process.env.MYSQL_DB_HOSTNAME;
const _MySQL_DB_UserName        =   process.env.MYSQL_DB_USERNAME;
const _MySQL_DB_Password        =   process.env.MYSQL_DB_PASSWORD;
const _MySQL_DB_DatabaseName    =   process.env.MYSQL_DB_DATABASE_NAME;
const _MySQL_DB_TableName       =   process.env.MYSQL_DB_TABLE_NAME;
const _MySQL_DB_TeacherColName  =   process.env.MYSQL_DB_TEACHER_COL_NAME;
const _MySQL_DB_StudentColName  =   process.env.MYSQL_DB_STUDENT_COL_NAME;

describe('GET /', () => { 
    describe('Test Connection', () => {
        it('should return the server is running', (done) => {
            request(app)
                .get('/')
                .expect(200)
                .expect((response) => {
                    expect(response.body.status).toBe("Server Is Running!");
                })
                .end(done);
        });
    });
});

describe('POST /api/register', () => { 
    it('should return the correct HTTP Status Code - 204', (done) => { 
        let teacherEmail   = "teachermartin@gmail.com";
        let studentEmails  = ["studentkent@gmail.com", "studentyam@yahoo.com"];
        request(app)
            .post('/api/register')
            .send({
                "teacher"  : teacherEmail,
                "students" : studentEmails
            })
            .expect(204)
            .end(done);
    });
});

describe('GET /api/commonstudents', () => { 

    describe('Common Students - Single Teacher', () => {
        it('should return array of all the students email address(s)', (done) => {
            request(app)
                .get('/api/commonstudents?teacher=teacherken@gmail.com')
                .expect(200)
                .expect((response) => {
                    expect(typeof response.body.students).toBe('object');
                    expect(response.body.students.length).toBe(3);
                })
                .end(done);
        });
    });

    describe('Common Students - Two Teachers', () => {
        it('should return the common student(s) Email Address(s)', (done) => {
            request(app)
                .get('/api/commonstudents?teacher=teacherken@gmail.com&teacher=teachersam@gmail.com')
                .expect(200)
                .expect((response) => {
                    expect(typeof response.body.students).toBe('object');
                    expect(response.body.students.length).toBe(1);
                    expect(response.body.students[0]).toBe('studentkite@gmail.com');
                })
                .end(done);
        });
    });
});

describe('POST /api/suspend', async () => {
    it('should return the correct suspended status of the student', (done) => {
        let teacherEmail = "teachersam@gmail.com";
        let studentEmail = "studentbill@gmail.com";
        request(app)
            .post('/api/suspend')
            .send({
                "teacher" : teacherEmail,
                "student" : studentEmail
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.message).toBe('Student is already suspended! (or) Student Email ID - Invalid!');
            })
            .end(done);
    });
    it('should return the teacher email address is not valid', (done) => {
        let teacherEmail = "teachertommy@gmail.com";
        let studentEmail = "studentbill@gmail.com";
        request(app)
            .post('/api/suspend')
            .send({
                "teacher" : teacherEmail,
                "student" : studentEmail
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.message).toBe('Teacher Email ID (or) Student Email ID - Invalid!');
            })
            .end(done);
    });
});

describe('POST /api/retrievefornotifications', () => { 
    it('should return the combined recipients of the student email address(s)', (done) => {
        let teacherEmail = "teacherandy@gmail.com";
        let notification = "Hello students! @studentagnes@gmail.com @studentquoine@gmail.com @studentmiche@yahoo.com";
        request(app)
            .post('/api/retrievefornotifications')
            .send({
                "teacher" : teacherEmail,
                "notification" : notification
            })
            .expect(200)
            .expect((response) => {
                expect(typeof response.body.recipients).toBe('object');
                expect(response.body.recipients.length).toBe(4);
            })
            .end(done);
    });
});
