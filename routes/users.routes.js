const express = require('express');

// Import our controllers
const userControllers = require('../controllers/users.controllers');
const authControllers = require('../controllers/auth.controllers');

// Create my express router instance
const router = express.Router();

//===============================================
// My routes

// Note: this middleware only works if the url has the id param.
// and that may help us in validating the params and so on in th future.
router.param('id', userControllers.checkParamId);

router
    .route('/signup')
    .post(authControllers.signupPOST)
    .get(authControllers.signupGET);

router
    .route('/')
    .get(userControllers.getAllUsers)
    .post(userControllers.createUser);

router
    .route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser);

//===============================================
// Export my router instance
module.exports = router;