var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose")
var userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique:true, 
        required:true
    },
    password: String,
    avatar:{
        type:String,
        default:'https://i.imgur.com/wGysdIt.png'
    },
    firstName:String,
    lastName:String,
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ],
    email:{ 
        type: String,  
        required:true
    }, 
    resetPasswordToken: String,
    resetPasswordExpires:Date,
    isAdmin: { 
        type: Boolean, 
        default: false 
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);