const mongoose = require('mongoose');

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
        trim: true
    },
    ratingAverage: {
        type: Number,
        default: 4.5
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
        required: [true, "The tour must have a difficulty!"]
    },
    discount: {
        type: Number,
        default: 0
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
    startDates: { // different dates for the tour
        type: Date
    }
  }, 
  { 
    timestamps: true 
    }
);

//=============================================
// Let's export our created model 
module.exports = mongoose.model('Tour', tourSchema);
