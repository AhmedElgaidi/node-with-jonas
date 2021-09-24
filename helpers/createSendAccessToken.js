const jwt = require('jsonwebtoken');
const ipInfo = require("ipinfo")
const User = require('../models/User');

// (1) Asign an access token
const signAccessToken = id => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    });
};

const createSendAccessToken = async (user, statusCode, res, message, req) => {
    const accessToken = signAccessToken(user.id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.ACCESS_TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //1day
          ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('accessToken', accessToken, cookieOptions);


    // start
    // const ip = '156.219.152.96'
    ipInfo(req.ip, async (err, info) => {
        info.accessToken = accessToken;
        // save access token
        const id = user.id
        await User.updateOne({id}, {
            $push: {
                connectedDevices: info
            }
    });
    });

    // end

    // Remove password from output
    user.password = undefined;
    console.log('new access token is asigned..............')
    res.status(statusCode).json({
        status: 'success',
        message,
        accessToken,
        data: {
        user
        }
    });
};

module.exports = createSendAccessToken;