const express  =  require('express');
const router   =  express.Router();

// Require controller modules.
const register_controller                =  require('../controllers/registerController');
const common_students_controller         =  require('../controllers/commonstudentsController');
const suspend_student_controller         =  require('../controllers/suspendstudentController');
const retrieve_notifications_controller  =  require('../controllers/retrievenotificationsController');

// POST request to register the students for a specified teacher.
router.post('/register', register_controller.register);

// GET request to fetch the list of common students for a specified number of teachers.
router.get('/commonstudents', common_students_controller.common_students);

// POST request to temporary terminate student for a specified teacher.
router.post('/suspend', suspend_student_controller.suspend_students);

// POST request to fetch the list of not suspended students for a specified teacher & unique emails from the notifications.
router.post('/retrievefornotifications', retrieve_notifications_controller.retrieve_notifications);

module.exports = router;