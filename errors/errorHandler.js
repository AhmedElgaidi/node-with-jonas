// let's make this class inherit from our Error class
class ErrorHandler extends Error {
    constructor(message, statusCode) {// we dont' have to pass status as it depends on statuCode
        // we use super to inherit message from parent class (Error)
        super(message);
        
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? 'Failed' : 'Error';
        // we classified errors into (operational, programmatic (problems in our code))
        // so now we can test this isOperational field and send the users only operational ones
        this.isOperational = true;
        // Let's capture the stack trace (the place where error happened)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;