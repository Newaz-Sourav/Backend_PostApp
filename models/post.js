const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true
    },
    date: { 
        type: Date,
        default: Date.now
    },

    content: {
        type: String
    },  

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        
    }],
})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;