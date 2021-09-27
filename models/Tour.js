const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./User');
//========================================
// Let's define our Schema
const Schema = mongoose.Schema;
const tourSchema = new Schema({
    // if we want to exclude andy property form this schema for returning back into the users
    // we could addd a built-in method called "select: false", that's it!
    name: {
        type: String,
        required: [true, "The tour must have a name!"],// buit-in validators
        unique: true,
        trim: true,
        // Let's try validate package here
        validate: [validator.isLowercase, 'should only have lowercase letters']
    },
    slug: String,
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be 1 or above!'],
        max: [5, 'ratin must be 5 or below'],
        // we could do a setter here
        set: value => Math.floor(value * 10) /10 
        // It's a good trick 4.666666 * 10 46.6666 then round and divide by 10
    },
    ratingQuantity: { // how many others rates this tour
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "The tour must have a price!"]
    },
    duration: {
        type: Number,
        required: [true, 'The tour must have a duration!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, "The tour must have a group size!"]
    },
    difficulty: {
        type: String,
        required: [true, "The tour must have a difficulty!"],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'Difficulty has is either: easy, medium, hard (NOT: {VALUE}!)'
        }
    },
    discount: {
        type: Number,
        default: 0,
        validate: {
            // Note: these validators works only for the first time (not when updating)
            // You need to specify runValidators option in the controllers
            // or we define it globally in our mongoose config file
            // mongoose.set('runValidators', true) in our (server.js)
            validator: function(value) {
                // the discount has to be < than the actual price
                return value < this.price; // this is our vanila function
                // but there are many npm packages to do this for us like validator.js
            }, 
            message: 'The discount ({VALUE}) has to be less than the actual price.'
        }
    },
    summary: {
        type: String,
        trim: true, // remove the begining and ending whitspaces
        required: [true, "The tour must have a summary!"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "The tour must have an image cover!"]
    },
    images: {
        type: Array
    },
    startDates: [Date], // different dates for the tour
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'point', // offered by mongodb
            // let's specifty that it's only option
            enum: ['point']
        },
        coordinates: [Number], // array of numbers
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'point',
            enum: ['point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    // guides: Array// this is in case of embeding example (need import as we used hooks down)
    guides: [{// child refrencing
        type: mongoose.Schema.ObjectId,
        ref: 'User' // we don't have to import user model in this case
    }]
    // Now, we are expecting array of objectIds, so we can populate them later
    //  when we call them in our query as query.populate('guides');
    // If we want to exclude some of user fields
    // query.populate({
        // path: 'guides',
        // select: '-__v -passwordChangedAt' 
    // });
    // So, populate is always used with refrencing, but try not to use it too much as it decrease
    // the preformance as mongoose do 2X1 query
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
// our virtual property
tourSchema
    .virtual('durationInWeeks')
    .get(function(next) { // now this field will be there in every doc, once we ask for data
        return this.duration / 7;
    });
// Note: we can't use this property in our query , as we said previously it's not on our db
// just created on every "get" call to our database 
// another example
tourSchema
    .virtual('sayHi')
    .get(function() {
        return `Hi from ${this.name}`
    })

// we could choose not to use this virtual propery, and do the task in our controllers
// But, it's the best practices as we separate our business and application logic
// Always try to make the model has all it's logic as much as possible
// business logic => means anything related to the buiness itself
// application logic => means things related to req and res etc.
//=======================================
// Indexing is to increase the performance in reading or searching and so on, but keep in mind,
// that indexed fields once updated or get more docs the arragnment re-indexed, that why don't 
//use indexing the frequently updated fields.
// tourSchema.index({ // this is called a compound index
//     price: 1,// this create index on our price fiedl in asc order
//     ratingAverage: -1// in dsc order
// });
// if we want to make unique index
// tourSchema.index({
//     price: 1
// });
// example: if we have a feature of makeing rate a tour, so we only have to let user rate only
// one time so no duplicates found, so we can do our aggregates and get the averages and so on
// so we can't make the tour index and user index itself as by this we only let tour to have one
// rate, and the user do one rate, and we don't want that, we want to make a comination of tour
// and user index in this case and that's it
// so, in our reviewschem
// reviewSchema.index({
//     tour: 1,
//     user: 1
// }, {
//     unique: true
// });


//=======================================
// document middlewares:
// MongoDB is just like express in the concept of middlewares(hooks)(functions listening 
// on certain events) such as:
// validate, save, remove, updateOne, deleteOne, aggregate
// there are hooks like pre, post on each of these tasks 
tourSchema.pre('save', function(next) {
    // this middleware get's executed only on saving new doc event
    // triggers when .save() .create() methods used
    this.slug = slugify(this.name, { // create slug from name field
        lower: true
    })
    next();
});

// Here, we learnt how to do embeding and not refrencing (relate tours to users)
// tourSchema.pre('save', async function(next) {
//     // this returns promises not documents
//     const guidesPromises = this.guides.map(async id => await User.findById(id));

//     // now let's override the simple guide array of ids to array of users
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

tourSchema.pre('save', function(next) {
    console.log('In next save hook')
    next();
});
// Note, we can have mutile middlewares for the same hook (save, update, etc), as much as we want
tourSchema.post('save', function(doc, next) {
    // excuete this function after saving a new doc

    next();
});
//=============================================
// Query middlewares:
// It allows us to run function on the query we want
tourSchema.pre(/^find/, function(next) { // every query starts with "find"
    // let's say we have sercet tours, and we dont' the public know about it
    // so let's create a secretTour field and on every find query, we exclude these docs
    this.find({
        secretTour: {
            $ne: true
        }
    });
    // we could do this in our controller, but just as we sait we should separate our 
    // buisness and application logic as much as possible
    next();
});
//Note: this only works for find query, but what about findOne or other?, of course will be included
// so, we have to options, createa new queery middleware, or we use regex
//================
// virtual population(population means don't make data persistence, that happens only when calling)
// Note: After we followed the parent refrencing on review model, now the review model donesn't
// who tours or user or thier count, just has their id. So, How do we populate the reviews docs
// from the tour direction?? we use virtuals for this
tourSchema.virtual('reviews', {
    // we need to add some options to implement virtual population not just population
    ref: 'Review',
    foreignField: 'tour', // the name of the tour field in reviow model
    localField: '_id'
})

//=============================================
// Aggregation middlewares allow use to add pre/ post hooks to our aggregation pipeline
tourSchema.pre('aggregation', function(next) {
    // to do the secretTour idea here on our aggregation piplines scope
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true
            }
        }
    })
    // there is no a problem in repeating any stage in our pipline
});


//=============================================
// Let's export our created model 
module.exports = mongoose.model('Tour', tourSchema);
