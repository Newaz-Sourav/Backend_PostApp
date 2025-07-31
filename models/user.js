const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({

    username:String,
    name:String,
    email:String,
    password:String,
    age:Number,
    // profileImage:{
    //     type:String,
    //     default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    // },
    posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
})

const User = mongoose.model('User', userSchema); 
module.exports = User;