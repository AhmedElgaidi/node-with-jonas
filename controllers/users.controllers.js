// Import our tours model
const User = require('../models/User');

//=====================================
// (1)
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
const
 updateUser= (req, res, next) => {
    res.send('update user page.')
};

const deleteUser= (req, res, next) => {
    res.send('delete user page.')
};

const checkParamId = (req, res, next) => {
    if(!Number(req.params.id)) return res.send('invalid ID');
    next();
};


//===========================================

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    checkParamId,
}