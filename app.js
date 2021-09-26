// Core modules

// 3rd party modules
const express = require('express');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Custom modules
// routes
const tourRoutes = require('./routes/tours.routes');
const userRoutes = require('./routes/users.routes');
const adminRoutes = require('./routes/admin.routes');

const globalErrorHandler = require('./controllers/errorControllers');

//==========================================
// Let's create our express app instance
const app = express();
//===========================================

// My middlewares

// parse application/json
app.use(express.json({ limit: '20mb' }));

// create application/x-www-form-urlencoded parser
// app.use(express.urlencoded({ extended: false, limit: '20mb' }));

// Serving static files
// Now, we can access these resources as follows: "http://localhost:8000/images/xss.png"
app.use(express.static('public'));

// For parsing our cookies
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
    // let every certain ip to send only 20 request in 1 hour
    max: 20, // 20 request
    windowMs: 60 * 60 * 1000, // 1h
    message: 'Too many requests from your IP. Please try again in an hour!'
});
// note, we don't have to use it on our '/api' as our express.static middleware could cause 
// a ddos on our server
// this middleware adds three headers on every request (total, remaining request, and time of reset)
app.use(limiter);// we also could use it on a certain route.

// Helmet (additional headers)
app.use(helmet()); // this middleware is a wrapper for about 14 smaller middlewares

// these sanitizer filters data from req.body, query params
// Data sanitization aganist NoSQL queries
app.use(mongoSanitize());

// Data sanitization aganist XSS
app.use(xss());

// Prevent parameter pollution with hpp
// In our case, we want to duplicate som query parameters, so, let's whitelist
app.use(hpp({
    whitelist: [ // we may don't need to whitelist them use this pacakage at all, but in our 
    // scheam, we need to test for every give query and so on, the result would be complex code
        "duration",
        "ratingQuantity",
        "ratingAverage",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}));

app.use( (req, res, next) => {

    next();
})


// My routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);

// 404 handler
app.all('*', (req, res, next) => {
    // for all HTTP methods and unhandeled routes
    res
        .status(404)
        .json({
            "status": "Failed",
            "message": `Can't find ${req.originalUrl} on our server`
        });
    next();
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
