const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
    select: false
  },
  photo: {
    type: String,
    trim: true,
    required: [true, 'Please, provide us with a photo!']
  },
  role: {
    type: String,// these all our application roles
    enum: ['user', 'guide', 'lead-guide', 'admin'],// allow certain values
    default: 'user'
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please, provide us with your password!'],
    minlength: [8, 'The password can\'t be less thatn 8 characters!'],
    select: false // it will never show this field over any sent data
    // unless we explicitly did that with select in our controllers
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
  },
  passwordChangedAt: {
    type: Date,// time of first creation or any modification later
    select: false
  },
  passwordResetToken: String,
  passwordResetTokenExpiresIn: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  connectedDevices: [{
    accessToken: String,
    ip: String,
    hostname: String,
    city: String,
    region: String,
    country: String,
    loc: String,
    org: String,
    timezone: String,
  }]
},{ 
  timestamps: true ,
  toJSON: { // to display our virtuals in case of asked data in form of json
      virtuals: true
  },
  toObject: { // if object
      virtuals: true
  }
});

//Note: if you dropped the database use createInex for every field alone to make it indexed

//=============================================
// Our mongoose middlewares
// Hash the passswords
userSchema.pre('save', async function(next) {
  // We want only to encrypt the password fields only when saving or updating
  // Imagine the user is updating his email, we don't want to re-encrypt the password again, right?
  // There is a method called isModified(), we can call it on any doc
  if(!this.isModified('password')) return next();

  // otherwise, is the hash the password
  this.password = await bcrypt.hash(this.password, 12);// 12 is the salt round
  // now, we don't want to use the passwordConfirm field anymore, we just used it for validation
  // we don't have to hash it too
  // So, give it the undefined value (by this move, we deleted the field)
  this.passwordConfirm = undefined;
  next();
});

// Asign the time of user changing his password
userSchema.pre('save', async function(next) {
  // we want to asign the field passwordChangedAt with the date of now, only if the field
  // it's modified or when creation a user account for the first time

  // if the password didn't change
  // we also need exclude the first modify as when creating a new account we chagne it from
  // undefined to the user password
  if(this.isModified('passwordChangedAt') || this.isNew) return next();

  // if user changed his password
  this.passwordChangedAt = Date.now(); 
  next();
});

// query middleware for hiding the deactivated users for appearing
// Any query starts with find
userSchema.pre('find', function(next) {
  this.find({ 
    isActive: {
      $ne: false // not jsut isActive: true // as it will hide all the docs that' don't have true
      // but, now it returns all the docs that don't have false or nothing at all. 
    }
  });
  next();
});

//=============================================
// Our methods
// Let's create an instance method (we can use on all docs in this user model)
userSchema.methods.correctPassword = async function(givenPassword, userPassword) {
  // this functions returns true only if they matched
  return await bcrypt.compare(givenPassword, userPassword);
};


userSchema.methods.createPasswordResetToken = function() {
  // We don't have to create a strong hash (take longer time) like we did with our access token, the crypto module
  // does this task very well.
  const resetToken = crypto.randomBytes(32).toString('hex');

  // let's hash it, as we can't save it in this way in our database, as it may be leaked
  // so, the attackers can controll all our user accounts
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // We also need to make it expires after a short time as a more security level (10m)
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;// m * s * ms

  // Now, we need to return the plain text version to the user mail box and save the hashed
  return resetToken;
};

userSchema.methods.createVerifyEmailToken = function() {
  const verifyEmailToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(verifyEmailToken).digest('hex');
  return verifyEmailToken;
};

//=============================================
// Let's export our created model 
module.exports = mongoose.model('User', userSchema);