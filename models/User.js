const mongoose = require('mongoose');
const validator = require('validator');

//========================================
// Let's define our Schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please, provide us with your name!'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please, provide us with your email!'],
    unique: true,
    trim: true,
    lowercase: true, // it's not a validtor, just convert the given string to lw
    validate: [validator.isEmail, 'Please, provide us with a valide email']
  },
  photo: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Please, provide us with a photo!']
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please, provide us with your password!'],
    minlength: [8, 'The password can\'t be less thatn 8 characters!']
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please, confirm your password!'],
    // let's create a custom validator
    // Remember: this works only for .save()
    validate: {
      validator: function(value) {
        return value === this.password; 
      },
      message: "Passwords didn't match!"
    }
  }
},{ 
  timestamps: true ,
  toJSON: { // to display our virtuals in case of asked data in form of json
      virtuals: true
  },
  toObject: { // if object
      virtuals: true
  }
});

//=============================================
// Let's export our created model 
module.exports = mongoose.model('User', userSchema);