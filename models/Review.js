const mongoose = require('mongoose');

//========================================
// Let's define our Schema
const Schema = mongoose.Schema;
const reviewSchema = new Schema({// let's follow parent refrencing approach here
    // we also need to use query.populate('tour').populate('user');
    // and we could do a middleware for ^find/ hook instead of doing population on every
    // query we have in our controllers
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: { // review need to belong to a tour 
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour!']
    },
    user: { // and also to a user
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user!']
    }
  }, 
  { 
    timestamps: true ,
    toJSON: { // to display our virtuals in case of asked data in form of json
        virtuals: true
    },
    toObject: { // if object
        virtuals: true
    }
  }
);
//=======================================


//=============================================
// Let's export our created model 
module.exports = mongoose.model('Review', reviewSchema);


// nested route
// In our case we need to add review by adding user id and tour id, in development we add them
// manually, but real world we need to it this way
// the user id should come from protect middleware we made (current user/ loggge in user)
// and the current tour is from the url, where the url that should posted review to like this
// POST /tour/234234234234/reviews (nested route)
// GET /tour/234234234234/reviews/2423423423
// and we have this concept especially 
//we have relations between our models
// And for not making our routes complex and duplicates and hard to maintain, we have to use
// somthing called nested routes in express(read about this), dont' forget { mergeParams: true }
// and from this point, we also don't want to make our conroller have duplicate handlers like
// reading, updateing deleting and so on, so we can make a factory function that return these 
// handlers for all of our models and put it in our controllers folder as it basically our conrollers

// we could also use this nesting concept with the tour and geospatial data, so we can get the nearst
// tour to the user place and so on
// router
//   .route('/tours-within/:distance/center/:latlng/unit/:unit')
//   .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi // we could do it with query string
// /tours-within/233/center/-40,45/unit/mi // but i liked this more and cleaner and by the way
// it's the standard way

/// now in our controllers
// /tours-within/233/center/34.111745,-118.113491/unit/mi
// exports.getToursWithin = catchAsync(async (req, res, next) => {
//     const { distance, latlng, unit } = req.params;
//     const [lat, lng] = latlng.split(',');

//      It's a func for getting the radius
//     const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
//     if (!lat || !lng) {
//       next(
//         new AppError(
//           'Please provide latitutr and longitude in the format lat,lng.',
//           400
//         )
//       );
//     }
  
//     const tours = await Tour.find({
//       startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
//     });
  
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         data: tours
//       }
//     });
//   });

/// Note: we could visualize our data into shapes so, we could easily observe them
// - mondob atlas dashboard => enable charts
// - mongodb compass => schema