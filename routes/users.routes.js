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
    .route('/verify-account/:token')
    .post(authControllers.verifyAccountPOST );

router
    .route('/login')
    .post(authControllers.loginPOST)
    .get(authControllers.loginGET);

router
    .route('/verify-login')
    .post(authControllers.verifyLoginPOST);

router
    .route('/logout')
    .get(
        authControllers.protect,
        authControllers.isActive,
        authControllers.logoutGET
    );
router
    .route('/update-password')
    .patch(
        authControllers.protect,
        authControllers.isActive,
        authControllers.updatePasswordPATCH
    )
    .get(authControllers.updatePasswordGET);

router
    .route('/update')
    .patch(
        authControllers.protect,
        authControllers.isActive,
        userControllers.updatePATCH
    )
    .get(userControllers.updateGET);

router
    .route('/deactivate')
    .post(
        authControllers.protect,
        authControllers.isActive,
        userControllers.deActivatePOST
    )
    .get(
        authControllers.protect,
        authControllers.isActive,
        userControllers.deActivateGET
    );

router
    .route('/activate')
    .patch(
        authControllers.protect,
        userControllers.activatePATCH
    );

router
    .route('/delete-account')
    .post(
        authControllers.protect,
        authControllers.isActive,
        userControllers.deleteAccountPOST
    );
// note: instead of making authcontrllers.protect and restrictTo duplicates here, we could use
// a simple middleware as follows:
// router.use(authControllers.get, authControllers.restrictTo);
router
    .route('/connected-devices')
    .get(
        authControllers.protect,
        authControllers.isActive,
        userControllers.connectedDevicesGET
    )
    .patch(
        authControllers.protect,
        authControllers.isActive,
        userControllers.connectedDevicesPATCH
    );

router
    .route('/forgot-password')
    .post(authControllers.forgotPasswordPOST)
    .get(authControllers.forgotPasswordGET);

router
    .route('/reset-password/:token')
    .patch(authControllers.resetPasswordPOST)
    .get(authControllers.resetPasswordGET);

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