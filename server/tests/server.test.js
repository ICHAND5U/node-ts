// Import Libraries Dependencies
const chai       = require('chai');
const chaiHttp   = require('chai-http'); 
const should     = chai.should();
const { expect } = require('chai');

// Register - Chai to use HTTP
chai.use(chaiHttp);

// Import Local Dependencies
const { app }     =  require('./../server');
const { MySQL }   =  require('./../db/mysql');

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

describe('GET Request (School API Endpoints)', function() {  

    describe('GET / : Setup - Test Connection', () => {
        it('should return the status of the established connection', (done) => {
            chai.request(app)
            .get('/')
            .end((error, response) => {
                // console.log(response.body);
                expect(error).to.not.exist;
                response.should.have.status(200);
                response.should.be.json;
                response.body.should.have.property('status');
                response.body.status.should.equal('Server Is Running!');
                response.body.should.have.property('statusCode');
                response.body.statusCode.should.equal(200);
                response.should.have.property('statusCode', 200);
                done();
            });
        });
    });

    describe('GET /api/commonstudents : Common Students - Single Teacher', () => {
        it('should return array of all the students email address(s)', (done) => {
            chai.request(app)
                .get('/api/commonstudents?teacher=jerry@teacher.com')
                .end((error, response) => {
                    // console.log(response.body);
                    expect(error).to.not.exist;
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.students.should.be.a('array');
                    response.body.should.have.property('students');
                    response.body.should.have.property('students').with.lengthOf(3);
                    done();
                });
        });
    });

    describe('GET /api/commonstudents : Common Students - Multiple Teachers', () => {
        it('should return the common student(s) Email Address(s)', (done) => {
            chai.request(app)
                .get('/api/commonstudents?teacher=jerry@teacher.com&teacher=barry@teacher.com')
                .end((error, response) => {
                    // console.log(response.body);
                    expect(error).to.not.exist;
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.students.should.be.a('array');
                    response.body.should.have.property('students');
                    response.body.should.have.property('students').with.lengthOf(2);
                    done();
                });    
        });
    });
});

describe('POST Request (School API Endpoints)', function() {  

    this.timeout(3000); // How long to wait for a response (ms)
   
    before(() => {
        // console.log("Before Running Tests!");
    });
   
    after(() => {
        // console.log("After Running Tests!");
    });

    describe('POST /api/register : Register the students for a specified teacher', () => {
        it('should return the correct HTTP Status Code - 404 with corresponding error message', (done) => {
            let payload = {
                "teacher": "jonny@teacher.com",
                "students": [
                    "roger@student.com",
                    "quoine@student.com"
                ]
            };
            chai.request(app)
                .post('/api/register')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Teacher Email Address - Already Exists!');
                    done();
                });
        });
        it('should return the correct error response when teacher email is not available', (done) => {
            let payload = {
                "teacher": "",
                "students": [
                    "roger@student.com",
                    "quoine@student.com"
                ]
            };
            chai.request(app)
                .post('/api/register')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Teacher Email Address - Not Available!');
                    done();
                });
        });
        it('should return the correct error response when students email(s) is empty', (done) => {
            let payload = {
                "teacher": "jonny@teacher.com",
                "students": []
            };
            chai.request(app)
                .post('/api/register')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Student Email(s) Address - Empty []');
                    done();
                });
        });
    });

    describe('POST /api/suspend : Temporary termination of the specified student by a teacher', () => {
        it('should return the correct suspended status of the student', (done) => {
            let payload = {
                "teacher": "barry@teacher.com",
	            "student": "david@student.com"
            };
            chai.request(app)
                .post('/api/suspend')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(204);
                    done();
                });
        });
        it('should return the correct status code with error message when teacher mail is not available', (done) => {
            let payload = {
                "teacher": "",
	            "student": "david@student.com"
            };
            chai.request(app)
                .post('/api/suspend')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Teacher Email Address - Not Available!');
                    done();
                });
        });
        it('should return the correct status code with error message when teacher mail is not present in the database', (done) => {
            let payload = {
                "teacher": "barrys@teacher.com",
	            "student": "david@student.com"
            };
            chai.request(app)
                .post('/api/suspend')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Teacher Email Address - Not Present In Database');
                    done();
                });
        });
        it('should return the correct status code with error message when student mail is not present in the database', (done) => {
            let payload = {
                "teacher": "barry@teacher.com",
	            "student": "david.willy@student.com"
            };
            chai.request(app)
                .post('/api/suspend')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Student Email Address - Not Present In Database');
                    done();
                });
        });

        it('should return the correct status code with error message when students mail(s) is empty', (done) => {
            let payload = {
                "teacher": "barrys@teacher.com",
	            "student": []
            };
            chai.request(app)
                .post('/api/suspend')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(404);
                    response.should.be.json;
                    response.body.should.have.property('success');
                    response.body.success.should.equal(false);
                    response.body.should.have.property('message');
                    response.body.message.should.equal('Student Email(s) Address - Empty []');
                    done();
                });
        });

    });

    describe('POST /api/retrievefornotifications : Send notification for all the students by using email(s)', () => { 
        it('should return the combined recipients of the student email address(s)', (done) => {
            let payload = {
                "teacher": "barry@teacher.com",
                "notification": "Hello students! @agnes@student.com @ruby@student.com @mick@student.com"
            };
            chai.request(app)
                .post('/api/retrievefornotifications')
                .send(payload)
                .end((error, response) => {
                    expect(error).to.not.exist;
                    response.should.have.status(200);
                    response.body.recipients.should.be.a('array');
                    response.body.should.have.property('recipients');
                    response.body.should.have.property('recipients').with.lengthOf(4);
                    done();
                });
        });
    });
});