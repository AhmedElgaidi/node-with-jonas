// Import our tours model
const User = require('../models/User');


const catchAsyncErrors = require('../errors/catchAsyncErrors');
const ErrorHandler = require('../errors/errorHandler');
//=====================================
const getAllUsers = async (req, res, next) => {
    try{
        //
        const query = {
        }
        
        //
        const users = await User.find(query).select('');
        return res.status(200).json({
            "status": "success",
            "results": users.length,
            "data": {
                users
            }
        });
    } catch(error) {
        return res
            .status(400).json({
                "status": "failed",
                "message": error.message
            });
    }

};

const createUser= (req, res, next) => {
    res.send('Create user page.')
};

const getUser= (req, res, next) => {
    res.send('get user page.')
};
const updateUser= (req, res, next) => {
    res.send('update user page.')
};

const deleteUser= (req, res, next) => {
    res.send('delete user page.')
};

const checkParamId = (req, res, next) => {
    if(!Number(req.params.id)) return res.send('invalid ID');
    next();
};

const updateGET = (req, res, next) => {
    res.send('User update his data page.')
};

const updatePATCH = catchAsyncErrors(async (req, res, next) => {
    // (1) Send error, if  the user tried to change his password
    const { name, email, photo, password, passwordConfirm } = req.body;
    if(password || passwordConfirm) {
        return next( 
            new ErrorHandler('This route is not for password updates. Please go to this route /update-passowr', 400) // 400 => Bad request
        );
    }
    // (2) Update user document as the user wishes
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        name, 
        email,
        photo
    },
    {
        new: true,
        runValidators: true,
        multi: true
    });

    res
        .status(200)
        .json({
            "status": "success",
            "message": "You updated your data successfully!",
            "data": {
                updatedUser
            }
        });
});

const deActivateGET = (req, res, next) => {
    res.send('User account de-activate page.')
};
const deActivatePOST = catchAsyncErrors(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res
        .status(200)// success
        .json({
            "status": "success",
            "message": "You deactivated your account successfully!"
        });
});

const activatePATCH = catchAsyncErrors(async (req, res, next) => {
    const deactivatedUser = await User
        .findOne({ email: req.body.email })
        .select('+isActive');

    // if email is incorrect
    if(!deactivatedUser) {
        return next( 
            new ErrorHandler('Invalid email or token!', 400) // 400 => Bad request
        );
    }
    // if the email is correct but it'ss already active
    if(deactivatedUser.isActive) {
        return next( 
            new ErrorHandler('Your email is already active!', 400) // 400 => Bad request
        );
    }
    deactivatedUser.isActive = true;
    await deactivatedUser.save({ validateBeforeSave: false});
    res
        .status(200)// success
        .json({
            "status": "success",
            "message": "Your account is activated successfully. Please have some fun!",
            deactivatedUser
        });
});

const deleteAccountPOST = catchAsyncErrors(async (req, res, next) => {
    await User.deleteOne({ _id: req.user._id });
    res
        .status('200')
        .json({
            "status": "success",
            "message": "Your account is deleted permanently!"
        })
});

const connectedDevicesGET = catchAsyncErrors(async (req ,res, next) => {
    const user = await User.findOne({_id: req.user.id});
    res.status(200).json({
        "status": "success",
        "data": {
            "Number of connected devices": user.connectedDevices.length,
            "All connected devices": user.connectedDevices,
            "Your device": req.cookies.accessToken
        }
    })
});

const connectedDevicesPOST = catchAsyncErrors(async (req ,res, next) => {
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
        "message": "The given device is diconnected successfully!"
    });
});

//===========================================

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    checkParamId,
    updateGET,
    updatePATCH,
    deActivateGET,
    deActivatePOST,
    activatePATCH,
    deleteAccountPOST,
    connectedDevicesGET,
    connectedDevicesPOST
}