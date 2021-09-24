const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sendEmail = require('../helpers/email');
const createSendAccessToken = require('../helpers/createSendAccessToken');

const catchAsyncErrors = require('../errors/catchAsyncErrors');
const ErrorHandler = require('../errors/errorHandler');

//==============================================

const signupGET = (req, res, next) => {
    res.send('signup page');
};  

const signupPOST = catchAsyncErrors(async (req, res, next) => {
    // We need to only specifiy the needed fields, not acepting the whole req.body
    // as the user can add more fields like making him self an admin and so on
    const { name, email, photo, password, passwordConfirm, role } = req.body;

    // (1) Now let's create the account
    const user = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        photo,
        role
    });
    // (2) Create verification token and save it to user document
    const verificationToken =  user.createVerifyEmailToken();
    user.verificationToken = verificationToken;
    user.save({ validateBeforeSave: false });
    
    // (3) Send the user email with the verification code
    const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/users/verify-account/${verificationToken}`;

    const message = `Do you want to verify your account? \nPlease submit a request to: ${verifyURL}.\nThank you for joining our amazing family!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Verification link',
            message
        });

        res.status(201).json({
            "status": "success",
            "message": "Account is created successfully. Please, go to your mail box and verify your account!"
        });
    
    } catch( err) {
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });
        
        // Then send the user a message
        next(
            new ErrorHandler('Something went wrong. Please, try again later', 500)// Interal error
        ); 
    }
});

const verifyAccountPOST = catchAsyncErrors(async (req ,res, next) => {
    const verificationToken = req.params.token;
    const user = await User.findOne({verificationToken}).select('+isVerified');
    if(!user) {
        return next(
            new ErrorHandler('Invalid token!', 400)// not found
        );
    }
    user.isVerified = true;
    user.save({ validateBeforeSave: false });

    res.status(200).json({
        "status": "success",
        "message": "your account is successfully verified. You can log in now!"
    })
});

const loginGET = (req, res, next) => {
    res.send('log in page');
};


const loginPOST = catchAsyncErrors(async(req, res, next) => {
    const { email, password } = req.body;

    // (1) Check if the email and password exist
    if (!email || !password) {
        return next(
             new ErrorHandler(`Please, provide use with email and password!`, 400)
        );
    }
    // (2) check if the user exists and the password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        // 401 = unauthorized
        // we could separte the logic, but we make it easy for the attacker to know which field
        // is incorrect and do his enumeration.
        return next(
            new ErrorHandler('Please, provide us with a valid email and password!', 401)
        );
    }

    // (3) if everything is okay, send an acess token to the client
    const message = 'You logged in successfully!';
    createSendAccessToken(user, 200, res, message, req);
});

const logoutGET = catchAsyncErrors(async (req, res, next) => {
    // we make user log out, by making him not able to log in hahaha

    // Remove tokens
    res.clearCookie("accessToken");
    // Deletet this token from user document
    const id = req.user.id
    await User.updateOne({id}, {
        $pull: {
            connectedDevices: {
                accessToken: req.cookies.accessToken
            }
        }
    });
    res.status(200).json({
        "status": "success",
        "message": "You logged out successfully!"
    })
});

const protect = catchAsyncErrors(async (req, res, next) => {
    // 1) Getting the access token and checking it's existence
    let accessToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        accessToken = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
        accessToken = req.cookies.accessToken;
      }
    console.log('from protect', {
        accessToken
    })
    if (!accessToken) {
        return next(
            new ErrorHandler('You are not logged in! Please log in to get access.', 401)//Not authorized
        );
    }
    // 2) Verifing the access token
    const decodedAccessToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // 3) Check if the user still exists
    // What if the user deleted his account, but the attacker stole
    // his access token? that's why we need to test for the existence of user in our DB
    const currentUser = await User.findById(decodedAccessToken.id).select('+isActive');
    if (!currentUser) {
        return next(
            new ErrorHandler(`The user belonging to this token doens't exist anymore!`, 401)
        );
    }
    // (6) Add this access token ot the user array of access tokens
    console.log('hi from protect', currentUser.accessTokens)


    // If every thing is okay, then proceed the next middleware
    req.user = currentUser; // As, we may need the user in the future, in the next middlewares
    next();
});

const isActive = (req, res, next) => {
    if(!req.user.isActive) {
        return next(
            new ErrorHandler('Your account is deactivated. Please, activate it first!', 401)
        );
    }
    next();
};
// our ordinary middleware can't work here, so we need to create a wrapper that contains
//  the middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array ['admin', 'lead-guide']
        // here we got the user role from the previous middleware (protect)
        if(!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`You don't have the permission to do that!`, 403)// forbidden
            );
        }

        next();
    };
};

const forgotPasswordPOST = catchAsyncErrors(async(req, res, next) => {
    // (1) Get user based on his given email
    const user = await User.findOne({ email: req.body.email });
    if(!req.body.email) {
        return next(
            new ErrorHandler('Please, provide us with your email!', 400)// not found
        );
    }
    if(!user) {
        return next(
            new ErrorHandler('The email address is not found!', 404)// not found
        );
    }

    // (2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    // now, we need to save the resetTokenExpires to our user document
    await user.save({
        // we also need to stop the validation on all user fields, as there are others like, name
        // password, photo are required, so we need to stop them for this route
        validateBeforeSave: false
    }); 

    // (3) Send the token to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? \nSubmit a request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please, ignore this email!`;

    // It's not enought to rely on our error handeling functions here, so we can use
    // try/ catch block
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (Valid only for 10 min.)',
            message
        });

        return res
            .status(200)
            .json({
                "status": "success",// and of course, we can't send the reset token there haha
                /// as the reset token is sent to our trobled user only
                "message": "Please, check your mail box!"
            });
    
    } catch( err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        // Then send the user a message
        next(
            new ErrorHandler('Something went wrong. Please, try again later', 500)// Interal error
        ); 
    }
});

const forgotPasswordGET = (req, res, next) => {
    res.json({
        "message": "forgot password",
        "resetToken": req.body.token
    });
};

const resetPasswordPOST = catchAsyncErrors(async(req, res, next) => {
    // (1) Get user by the given token

    // Do you remebmer the token we sent in the mail box wasn't encrypted, the one in our db
    // is the encrypted one, so we need to encrypt it with the same way and compare, right?
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // now, let's get the user by his passwordResetToken field
    const user = await User.findOne({ 
        passwordResetToken: hashedToken
    });

    // let's first check if we have this user in our database or not, right?
    if(!user) {
        return next(
            new ErrorHandler(`Invalid token. Please, don't manipulate the token!`, 404)
        );
    }

    // now, how could we now that the token is not expired (more then our 10 min.) ?
    // there are many ways to do this in aggregation, bu let's do it this way
    const isExpired = await User.findOne({
        // we could do this from the begining in only one query, but tosend more specific respond
        $and: [
            {
                passwordResetToken: hashedToken
            },
            {
                passwordResetTokenExpiresIn: { 
                    $lt: Date.now() 
                }
            }
        ]
    });
    if(isExpired) {
        return next(
            new ErrorHandler('Your token already expires. Please go to forgot password again!', 400)
        );
    }

    // (2) if the user exists and the token is not expired, set the new password
    const { password, passwordConfirm } = req.body;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetTokenExpiresIn = undefined;
    user.passwordResetToken =  undefined;
    // Now, save the user data
    await user.save();

    // (3) Update the changePasswordAt property
    // note: we changed it on our model level
    
    // (4) Log the user in by asigning him a jwt
    const message = 'Your password reset done successfully!'
    createSendAccessToken(user, 200, res, message, req);
    next();
});

const resetPasswordGET = (req, res, next) => {
    res.send('Reset password page')
};

const updatePasswordPATCH = catchAsyncErrors( async(req, res, next) => {
    // (1) Get the user form the collection
    // Remeber: we have the user object from protect middleware, and this user has to be logged
    // in to perform this action, so we can get his data by this object, so we don't have to get
    // the user form req.body
    const user = await User.findById(req.user._id).select('+password');

    // (2) Check if the given password is correct or not
    const { password, passwordConfirm, passwordCurrent } = req.body;
    const isPasswordCorrect = await user.correctPassword(passwordCurrent, user.password);

    if(!isPasswordCorrect) {
        return next(
            new ErrorHandler('Wrong password. Please provide us with the true one!', 401)// unauthorized
        );
    }

    // (3) if So, then update the password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // Remember: we can't use findByIdAndUpdate, as our validators and our custom pre save hooks
    // only works for save() and create()

    // (4) Now, give the user an access token to log in
    const message = 'You password updated successfully!';
    createSendAccessToken(user, 200, res, message, req);
    next();
});

const updatePasswordGET = (req, res, next) => {
    res.send('update password page')
};

//==============================================
module.exports = {
    signupGET,
    signupPOST,
    verifyAccountPOST,
    loginGET,
    loginPOST,
    logoutGET,
    protect,
    restrictTo,
    forgotPasswordPOST,
    forgotPasswordGET,
    resetPasswordPOST,
    resetPasswordGET,
    updatePasswordPATCH,
    updatePasswordGET,
    isActive
}