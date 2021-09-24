const express = require('express');

// Import our controllers
const toursControllers = require('../controllers/tours.controllers');
const authControllers = require('../controllers/auth.controllers');

// Create my express router instance
const router = express.Router();

//===============================================
// My routes

// Note: this middleware only works if the url has the id param.
// and that may help us in validating the params and so on in th future.
router.param('id', toursControllers.checkParamId);

router
    .route('/stats')
    .get(toursControllers.getTourStats);

router
    .route('/montyly-plan/:year')
    .get(toursControllers.getMonthlyPlan);

router
    .route('/top-5-cheap-maxGroupSize')
    .get(
        toursControllers.topFiveCheapestTours, 
        toursControllers.getAllTours
    );

router
    .route('/')
    .get(
        authControllers.protect,
        authControllers.isActive,
        toursControllers.getAllTours
    )
    .post(toursControllers.createTour);

router
    .route('/:id')
    .get(toursControllers.getTour)
    .patch(toursControllers.updateTour)
    .delete(
        authControllers.protect, 
        authControllers.restrictTo('admin', 'lead-guide'), 
        toursControllers.deleteTour
    );

//===============================================
// Export my router instance
module.exports = router;