const ErrorHandler = require('../errors/errorHandler');

// (1) Handeling cast error
// /tours/id if it's not complete (i mean not complete, not just valid)
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ErrorHandler(message, 404);
};
// (2) Duplicate field error
const handleDuplicateField = err => {
    const value = err.message.match(/(["'])(\\?.)*?\1/);
    
    const message = `Duplicate value: ${value}. Please, choose another value!`;

    return new ErrorHandler(message, 400);
};
// (3) validation errors
const handleValidationError = err => {
    const errors = {};
    Object.values(err.errors).forEach(properties => {
        errors[properties.path] = properties.message;
        return errors;
    });
    const message = JSON.stringify(errors);
    return new ErrorHandler(message, 400);
};

// (4) jwt errors
const handleJWTErrors = () => {
    return new ErrorHandler('Invalid token, Please, log in again!', 401)// un-authorized
};

// (5) Expired acces token errors
const handleJWTExpireErrors = () => {
    return new ErrorHandler('Expired token, Please, log in again!', 401)// un-authorized
};


const sendError = (err, res) => {
    // Operational errors: trusted predicted errors (send it to the client)
    if (err.isOperational) {
        res
            .status(err.statusCode)
            .json({
                "status": err.status,
                "message": err.message
            });
    // Programming or other unknown errors(3rd party errors): don't leack error details
    } else {
        // 1) log the error
        console.error({ "Error": err });
        // 2) send generic message to the client
        // this is our standard error message for any error happens we, didn't know implement
        // a solution for it
        res
            .status(500)
            .json({
                "status": 'error',
                "message": 'something went wrong'
            });
    }

};
 

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err }; // to prevent overide on our err object
    error.message = err.message

    if(err.name === 'CastError') error = handleCastErrorDB(error);
    if(err.code === 11000) error = handleDuplicateField(error);
    if(err.name === 'ValidationError') error = handleValidationError(error);
    if(err.name === 'JsonWebTokenError') error = handleJWTErrors();
    if(err.name === 'TokenExpiredError') error = handleJWTExpireErrors();
    sendError(error, res);
    next();

    // now, in every catch block we just need to throw err (create it)
    // const err = new Error();
    // and in the next() method in our middewares, we pass the err object to it, as express
    // knows that only err object passes to it, so it doens't have go to all middlewares, just
    // the error handeling middleware, so it responses faster and doesn't over-load our server.
}