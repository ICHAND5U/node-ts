## Node TS

Teachers need a system where they can perform administrative functions for their students. Teachers and students are identified by their email addresses.

## Live Demo:

AWS Deployment URL: http://ec2-52-91-164-113.compute-1.amazonaws.com:5555

## Technology Used:

1. Backend - Node.js
2. Testing - Mocha
2. Database - AWS RDS (MySQL)
3. Deployment - AWS EC2

## AWS RDS (MySQL):

Endpoint: node-ts.cka14oska139.us-east-1.rds.amazonaws.com </br>
Port: 3306 </br>
Publicly Accessible: Yes

![MySQL Schema](https://s3.amazonaws.com/bucket-storage-box/mysql-schema.png)
![MySQL Storage](https://s3.amazonaws.com/bucket-storage-box/mysql-storage.png)

## Demo API Routes:

| Request Method | URL Endpoint |
| --- | --- |
| POST | /api/register |
| GET | /api/commonstudents?teacher=teacherken%40example.com |
| GET | /api/commonstudents?teacher=teacherken%40example.com&teacher=teacherjoe%40example.com |
| POST | /api/suspend |
| POST | /api/retrievefornotifications |

## Live API Routes:

| Request Method | URL Endpoint |
| --- | --- |
| POST | http://52.91.164.113:5555/api/register |
| GET | http://52.91.164.113:5555/api/commonstudents?teacher=teacherken@gmail.com |
| GET | http://52.91.164.113:5555/api/commonstudents?teacher=teacherken@gmail.com&teacher=teachersam@gmail.com |
| POST | http://52.91.164.113:5555/api/suspend |
| POST | http://52.91.164.113:5555/api/retrievefornotifications |

## Postman Collection:

URL: https://www.getpostman.com/collections/b10e3dcde5f835623e2a

## Examples:

| Type | Description |
| --- | --- |
| Method | POST |
| Endpoint | /api/register |
| Body | JSON: {{ "teacher": "teachermartin@gmail.com", "students": ["studentkent@gmail.com", "studentyam@yahoo.com"] }} |
| Response |  Status: 204 No Content |

| Type | Description |
| --- | --- |
| Method | GET |
| Endpoint | /api/commonstudents?teacher=teacherken@gmail.com |
| Response | JSON: { "students": ["studentjen@gmail.com", "studentandrew@gmail.com", "studentkite@gmail.com"] } |

| Type | Description |
| --- | --- |
| Method | GET |
| Endpoint | /api/commonstudents?teacher=teacherken@gmail.com&teacher=teachersam@gmail.com |
| Response | JSON: { "students": ["studentkite@gmail.com"] } |

| Type | Description |
| --- | --- |
| Method | POST |
| Endpoint | /api/suspend |
| Body | JSON: { "teacher": "teachersam@gmail.com", "student": "studentarun@gmail.com" } |
| Response |  JSON: { "message": "Student is already suspended! (or) Student Email ID - Invalid!" } |

| Type | Description |
| --- | --- |
| Method | POST |
| Endpoint | /api/retrievefornotifications |
| Body | JSON: { "teacher": "teacherandy@gmail.com", "notification": "Hello students! @studentagnes@gmail.com @studentquoine@gmail.com @studentmiche@yahoo.com" } |
| Response |  JSON: { "recipients": ["studentagnes@gmail.com", "studentquoine@gmail.com", "studentmiche@yahoo.com", "studentkite@gmail.com"] } |

## Contributor:

1. Karthekeyan: https://github.com/imkarthekeyan


