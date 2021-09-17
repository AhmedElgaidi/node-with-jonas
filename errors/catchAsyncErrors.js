// Let's catch our async errors
module.exports = fn => {
// this function is a replacement for our try/ catch blocks, in order to remove duplicate code
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};