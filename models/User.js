const mongoose = require('mongoose');

//========================================
// Let's define our Schema
const Schema = mongoose.Schema;
const userSchema = new Schema(  {
    "name": String,
    "guid": String,
    "isActive": Boolean,
    "balance": String,
    "picture": String,
    "age": Number,
    "eyeColor": String,
    "gender": String,
    "company": String,
    "email": String,
    "phone": String,
    "address":String,
    "about": String,
    "registered": String,
    "latitude": Number,
    "longitude": Number,
    "tags": [
        String
    ],
    "friends": [
      {
        "id": mongoose.SchemaTypes.ObjectId,
        "name": String
      }
    ],
    "greeting": String,
    "favoriteFruit": String
  });

//=============================================
// Let's export our created model 
module.exports = mongoose.model('User', userSchema);