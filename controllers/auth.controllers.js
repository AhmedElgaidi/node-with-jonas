const User = require('../models/User');
const catchAsyncErrors = require('../errors/catchAsyncErrors');

//==============================================
const signupGET = (req, res, next) => {
    res.send('signup page');
};  

const signupPOST = catchAsyncErrors(async (req, res, next) => {
    const newUser = await User.create(req.body);
    res
        .status(201)
        .json({
            "status": "success",
            "data": {
                user: newUser
            }
        });
});

//==============================================
module.exports = {
    signupGET,
    signupPOST
}