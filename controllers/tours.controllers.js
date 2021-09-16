// Import our tours model
const Tour = require('../models/Tour');

const APIFeatures = require('../helpers/apiFeatures');

//=====================================

const topFiveCheapestTours = (req, res, next) => {// to get cheapest and largest gropu size
    // they have to be strings
    req.query.limit = '5';
    req.query.fields = 'name,price,maxGroupSize';
    req.query.sort = '-maxGroupSize,price';
    next();
};

const getAllTours = async (req, res, next) => {
    try {
        // Let's create an instance (object) from our class APIFeatures
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate(); 
        // Let's execute our query
        const tours = await features.query;

        // Let's send response
        return res
            .status(200).json({
                "status": "success",
                "results": tours.length,
                "data": {
                    tours
                }
            });
    } catch (error) {
        return res
            .status(400).json({
                "status": "failed",
                "message": error.message
            });
    }
};

const getTour = async (req, res, next) => {
    try {
        const tour = await Tour.findById(req.params.id);
        return res
            .status(200).json({
                "status": "success",
                "data": {
                    tour
                }
            });
    } catch (error) {
        return res
            .status(400).json({
                "status": "failed",
                "message": error.message
            });
    }
};
const createTour = async (req, res, next) => {
    try{
        const newTour = await Tour.create(req.body);
        res.send({
            newTour
        });
    } catch(error) {
        res
            .status(400)
            .json({
                status: "failed",
                message: error
            });
    }
};

const updateTour = async (req, res, next) => {
    try{
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // we have to add this to return the updated document.
            runValidators: true // to run the defined validtors in our schema.
        })
        res.send({
            "status": "success",
            data: {
                updatedTour
            }
        })
    } catch(error) {
        res
            .status(400)
            .json({
                status: "failed",
                message: error.message
            });
    }
};

const deleteTour = async (req, res, next) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);
            res
            .status(201)
            .send({
                "status": "success",
                data: {
                    "message": "The tour is deleted"
                }
            });
    } catch(error) {
        res
            .status(400)
            .json({
                status: "failed",
                message: error.message
            });
    }
};

const checkParamId = (req, res, next) => {
    // check the validity of the id
    next();
};

const getTourStats = async (req, res, next) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: {
                    ratingAverage: {
                        $gte: 1.5
                    }
                }
            },
            {
                $group: {
                    _id: '$difficulty', // this will group this into our difficulty levels
                    ToursNumber: {    // those stats will be for each level
                        $sum: 1
                    },
                    numRating: {
                        $sum: '$ratingQuantity'
                    },
                    avgRating: {
                        $avg: '$ratingAverage'
                    },
                    avgPrice: {
                        $avg: '$price'
                    },
                    minPrice: {
                        $min: '$price'
                    },
                    maxPrice: {
                        $max: '$price'
                    }
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            },
            {// we can repeat any stage we want
                $match: {
                    _id: { // this will bring medium, hard
                        $ne: 'easy'
                    }
                }
            }
        ]);
        return res
            .status(200).json({
                "status": "success",
                "data": {
                    stats
                }
            });
    } catch(error) {
        res
            .status(400)
            .json({
                status: "failed",
                message: error.message
            });
    }
    next();
};

const getMonthlyPlan = async (req, res, next) => {
    try {
        const year = +req.params.year;
        const plan = await Tour.aggregate([
            // let's say we have an field called startDates, in which the same tour happens
            // in a given year ['date1', 'date2', 'date3'],
            {
                $unwind: '$startDates'// now we splitted each array elements into new docs
            },
            {
                $match: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$startDates'// now we are grouping them by month
                    },
                    numTourStart: {
                        $sum: 1 // number of tours for every present month
                    },
                    tours: {
                        $push: '$name' // this will push all tours in the same month
                        // to an array
                    }
                }
            },
            {
                $addField: { // add field stage
                    month: '$_id' // just to remove the _id key in the next stage
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    numTourStart: -1 // get highest month with tours first
                }
            },
            {
                $limit: 3 // limit the output to 3 docs
            }
        ]);
        return res
        .status(200).json({
            "status": "success",
            "data": {
                plan
            }
        });

    } catch(error) {
        res
            .status(400)
            .json({
                status: "failed",
                message: error.message
            });
    }
    next();
};
//===========================================

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    checkParamId,
    topFiveCheapestTours,
    getTourStats,
    getMonthlyPlan
}