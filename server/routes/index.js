const express  =  require('express');
const router   =  express.Router();

// Require controller modules.
const index_controller = require('../controllers/indexController');

// GET request to map the home page
router.get('/', index_controller.index);

module.exports = router;