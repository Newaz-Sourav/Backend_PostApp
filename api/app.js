const express = require('express');
const connectDB = require('../config/db');
const usermodel = require('../models/user');
const Post = require('../models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer  = require('multer')
const crypto = require('crypto');
const path = require('path');
const upload = require('../config/multer');
const cors = require('cors');


const app = express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
connectDB();




app.get('/', async (req, res) => {
  try {
    const allPosts = await Post.find().populate('user', 'username name');
    res.status(200).json(allPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.post('/upload', isloggedIn,upload.single('file'), async (req, res) => {

//   const user = await usermodel.findById(req.user.userid);

//   user.profileImage = req.file.filename;
//   await user.save();  
//   res.status(200).json({ message: 'File uploaded successfully', file: req.file.filename });

// });

app.post('/register', async (req, res) => {
  let { username, name, email, password, age } = req.body;
    try {
        if (!username || !name || !email || !password || !age) {
            return res.status(400).json({ error: 'All fields are required' });
        }

       
        const existingUser = await usermodel.findOne({ email });
        if (existingUser)
        {
            return res.status(400).json({ error: 'User already exists' });
        }

        

        bcrypt.genSalt(10, (err,salt)=>{

            
            if (err) {
                return res.status(500).json({ error: 'Error generating salt' });
            }

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: 'Error hashing password' });
                }

                password = hash;
                
                const newUser = new usermodel({ username, name, email, password, age });
                await newUser.save();
                let token = jwt.sign({email: email, userid: newUser._id },"shhh");
                 res.cookie('token', token);
                res.status(201).json({ message: 'User registered successfully' });

            });
        })

    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
})


app.post('/login', async (req, res) => {
  const { email, password } = req.body; 
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await usermodel.findOne({ email: email });
    if (!user) {    
        return res.status(400).json({ error: 'User not found' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const token = jwt.sign({ email: user.email, userid: user._id }, "shhh");
      res.cookie('token', token);
      res.status(200).redirect('/profile');
      //res.status(200).json({ message: 'Login successful', token });
    });

  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
}); 

app.get('/profile', isloggedIn, async (req, res) => {
 
  const { email, userid } = req.user;

  const user = await usermodel.findOne({email: email}).populate('posts');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({
    username: user.username,
    name: user.name,
    email: user.email,
    age: user.age,
    profileImage: user.profileImage,
    content: user.posts.map(post => ({
      id: post._id,
      content: post.content,
      date: post.date
    }))
  });

  })

  app.post('/post', isloggedIn, async (req, res) => {
    const { content } = req.body;
    const { userid } = req.user;

    let user = await usermodel.findById(userid);

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const newPost = new Post({
            user: userid,
            content: content
        });

        
        
        await newPost.save();
        user.posts.push(newPost._id);
        await user.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }});

    app.get('/like/:id', isloggedIn, async (req, res) => {

      const post= await Post.findById(req.params.id).populate('user');

      if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
      }

      else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
      }

      await post.save();
      res.status(200).json({ message: 'Like status updated', likes: post.likes.length
    });

  });

  app.post('/update/:id' , isloggedIn, async (req, res) => {

    let newpost = await Post.findOneAndUpdate({_id: req.params.id}, {content: req.body.content}, {new: true});
    
    if (!newpost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    else {
      res.status(200).json({ message: 'Post updated successfully', newpost });
    }
  });

function isloggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("You are not logged in");
  }

  try {
    const decoded = jwt.verify(token, "shhh");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token: You are not logged in");
  }
}


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

module.exports = app // Export the app for testing or other purposes