// Core modules

// 3rd party modules
const express = require('express');
const cookieParser = require("cookie-parser");


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



app.use( async(req, res, next) => {

    //
    


    next();
})
// const myFunc = async () => {
//     const response = await fetch('ipinfo.io/156.219.152.96?token=07d8eb107817df');
//     const data = await response.json();
//     console.log(data)
// }
// myFunc()


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
