## Node TS

Teachers need a system where they can perform administrative functions for their students. Teachers and students are identified by their email addresses.

## Live Demo:

AWS Deployment URL: http://ec2-18-233-166-235.compute-1.amazonaws.com:5005/

## Technology Used:

1. Backend - Node.js With Express Framework
2. Testing - Chai
2. Database - AWS RDS (MySQL)
3. Deployment - AWS EC2

## AWS RDS (MySQL):

Endpoint: node-ts.cka14oska139.us-east-1.rds.amazonaws.com </br>
Port: 3306 </br>
Publicly Accessible: Yes

#### MySQL DB Schema Design:

###### Table Name: Students
* Primary Key - Email ID (Student)
* Fields - Name & Email

###### Table Name: Teachers
* Primary Key - Email ID (Teacher)
* Fields - Name & Email

###### Table Name: Teachers_Students
* Primary Keys - Email ID(s) (Teacher_Email & Student_Email)
* Foreign Keys - Email ID(s) (Teacher & Student)
* Fields - Teacher_Email & Teacher_Email & Is_Suspended

#### MySQL Schema Store:
![MySQL Schema](https://s3.amazonaws.com/bucket-storage-box/Screen+Shot+2018-06-29+at+9.44.44+PM.png)

#### MySQL Schema Storage:
![MySQL Storage](https://s3.amazonaws.com/bucket-storage-box/Screen+Shot+2018-06-29+at+10.09.42+PM.png)
![MySQL Storage](https://s3.amazonaws.com/bucket-storage-box/Screen+Shot+2018-06-29+at+10.09.57+PM.png)

## Assumptions: (Based on User Stories)
1. Suspend from the class needed the corresponding teacher email address. So, included in the POST request body.

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
| GET | http://52.91.164.113:5555/api/commonstudents?teacher=jerry@teacher.com |
| GET | http://52.91.164.113:5555/api/commonstudents?teacher=jerry@teacher.com&teacher=barry@teacher.com |
| POST | http://52.91.164.113:5555/api/suspend |
| POST | http://52.91.164.113:5555/api/retrievefornotifications |

## Postman Collection:

URL: https://www.getpostman.com/collections/b10e3dcde5f835623e2a

## Examples:

| Type | Description |
| --- | --- |
| Method | POST |
| Endpoint | /api/register |
| Body | JSON: { "teacher": "jonny@teacher.com", "students": ["roger@student.com", "quoine@student.com"] } |
| Response |  Status: 204 No Content |

| Type | Description |
| --- | --- |
| Method | GET |
| Endpoint | /api/commonstudents?teacher=jerry@teacher.com |
| Response | JSON: { "students": ["alex@student.com", "david@student.com", "kite@student.com"] } |

| Type | Description |
| --- | --- |
| Method | GET |
| Endpoint | /api/commonstudents?teacher=jerry@teacher.com&teacher=barry@teacher.com |
| Response | JSON: { "students": ["david@student.com","kite@student.com"] } |

| Type | Description |
| --- | --- |
| Method | POST |
| Endpoint | /api/suspend |
| Body | JSON: { "teacher": "barry@teacher.com", "student": "david@student.com" } |
| Response |  Status: 204 No Content |

| Type | Description |
| --- | --- |
| Method | POST |
| Endpoint | /api/retrievefornotifications |
| Body | JSON: { "teacher": "barry@teacher.com", "notification": "Hello students! @agnes@student.com @ruby@student.com @mick@student.com" } |
| Response |  JSON: { "recipients": ["david@student.com", "agnes@student.com", "ruby@student.com", "mick@student.com"] } |

## Contributor:

1. Karthekeyan: https://github.com/imkarthekeyan


