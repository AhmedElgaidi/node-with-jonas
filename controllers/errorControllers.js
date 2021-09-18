const ErrorHandler = require('../errors/errorHandler');

// (1) Handeling cast error
// /tours/id if it's not complete (i mean not complete, not just valid)
const handelCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ErrorHandler(message, 404);
};
// (2) Duplicate field error
const handelDuplicateField = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate value: ${value}). Please, choose another one!`;
    return new ErrorHandler(message, 400);
};
// (3) validation errors
const handelValidationError = err => {
    const errors = {};
    Object.values(err.errors).forEach(properties => {
        errors[properties.path] = properties.message;
        return errors;
    });
    const message = JSON.stringify(errors);
    return new ErrorHandler(message, 400);
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
        console.error(`Error: ${err}`);
        // 2) send generic message to the client
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

    if(err.name === 'CastError') error = handelCastErrorDB(err);
    if(err.code === 11000) error = handelDuplicateField(err);
    if(err.name === 'ValidationError') error = handelValidationError(err);
    sendError(error, res);

    // now, in every catch block we just need to throw err (create it)
    // const err = new Error();
    // and in the next() method in our middewares, we pass the err object to it, as express
    // knows that only err object passes to it, so it doens't have go to all middlewares, just
    // the error handeling middleware, so it responses faster and doesn't over-load our server.
}