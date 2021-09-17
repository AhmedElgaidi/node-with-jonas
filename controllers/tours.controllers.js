// Import our tours model
const Tour = require('../models/Tour');

const APIFeatures = require('../helpers/apiFeatures');

const catchAsyncErrors = require('../errors/catchAsyncErrors');
const ErrorHandler = require('../errors/errorHandler');

//=====================================

const topFiveCheapestTours = (req, res, next) => {// to get cheapest and largest gropu size
    // they have to be strings
    req.query.limit = '5';
    req.query.fields = 'name,price,maxGroupSize';
    req.query.sort = '-maxGroupSize,price';
    next();
}
// we could write cal l the catchAsyncErrors in our routes instead of here/
// but, we may don't have all our controllers async functions, right?
// So, it' better to be here instead of there, just for not confusing.
const getAllTours = catchAsyncErrors(async (req, res, next) => {
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
    
});

const getTour = catchAsyncErrors(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if(!tour) {
        // we passed the error to our error handler
        return next(new ErrorHandler(`Can't find tour with this ID`, 404));
    }

    return res
        .status(200).json({
            "status": "success",
            "data": {
                tour
            }
        });
});
const createTour = catchAsyncErrors(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.send({
        newTour
    });
})

const updateTour = catchAsyncErrors(async (req, res, next) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // we have to add this to return the updated document.
        runValidators: true // to run the defined validtors in our schema.
    })

    if(!updatedTour) {
        // we passed the error to our error handler
        return next(new ErrorHandler(`Can't find tour with this ID`, 404));
    }

    res.send({
        "status": "success",
        data: {
            updatedTour
        }
    });
});

const deleteTour = catchAsyncErrors(async (req, res, next) => {
    await Tour.findByIdAndDelete(req.params.id);

    if(!deleteTour) {
        // we passed the error to our error handler
        return next(new ErrorHandler(`Can't find tour with this ID`, 404));
    }

    res
        .status(201)
        .send({
            "status": "success",
            data: {
                "message": "The tour is deleted"
            }
        });
});

const checkParamId = (req, res, next) => {
    // check the validity of the id
    next();
}

const getTourStats = catchAsyncErrors(async (req, res, next) => {
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
});

const getMonthlyPlan = catchAsyncErrors(async (req, res, next) => {
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
});
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