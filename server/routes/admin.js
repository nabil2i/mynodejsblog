
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const bcrypt = require('bcrypt'); // to decrypt the password
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


// middleware check connection
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId= decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
}
  


// Admin routes

// GET admin page login
router.get('/', async (req, res) => {
  
  try {
    const locals = {
      title: "Admin",
      description: "Admin"
    }
    //const data = await Post.find();
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


// GET admin page register
router.get('/register', async (req, res) => {
  
  try {
    const locals = {
      title: "Admin",
      description: "Admin"
    }

    //const data = await Post.find();

    res.render('admin/register', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// GET admin dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  
  try {
    const locals = {
      title: "Dashboard",
      description: "Admin"
    }
    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      layout: adminLayout,
      data
    });
  } catch (error) {
    console.log(error);
  }
});

// GET create new post
router.get('/add-post', authMiddleware, async (req, res) => {
  
  try {
    const locals = {
      title: "Add post",
      description: "Admin"
    }
    //const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

// GET edit post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  
  try {
    const locals = {
      title: "Edit post",
      description: "Admin"
    }
    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      data,
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});


// PUT edit post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/admin/edit-post/${req.params.id}`)
  } catch (error) {
    console.log(error);
  }
});


// POST create new post
router.post('/add-post', authMiddleware, async (req, res) => {
  
  try {
    // console.log(req.body);
    
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/admin/dashboard');

    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

// POST admin login
router.post('/', async (req, res) => {
  
  try {
    const { username, password } = req.body;
    //console.log(req.body);
    const user = await User.findOne( { username });
    if(!user) {
      return res.status(401).json({ message: 'Invalid credentials.'})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.'})
    }

    const token = jwt.sign( {userId: user._id }, jwtSecret);
    // save token as cookie
    res.cookie('token', token, { httpOnly: true});

    res.redirect('/admin/dashboard');
    
    
  } catch (error) {
    console.log(error);
  }
});

// POST admin register
router.post('/register', async (req, res) => {
  
  try {
    const { username, password, password2 } = req.body;
    console.log(req.body);
    if (password !== password2) {
      res.status(400).json({ message: "Invalid credentials."});

    }
    //console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword});
      res.status(201).json({ message: "user created",  user});
    } catch (error) {
        if (error.code === 11000) {
          res.status(409).json({ message: "user already in use"});
        }
        res.status(500).json({ message: "Inernal server error"});

    }

  } catch (error) {
    console.log(error);
  }
});


 // DELETE post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  
  try {
    await Post.deleteOne({ _id: req.params.id});
    res.redirect('/admin/dashboard');

  } catch (error) {
    console.log(error);
  }
});

 // GET Logout
 router.get('/logout', authMiddleware, async (req, res) => {
  
  try {
    res.clearCookie('token');
    // res.json({ message: " Logout successful."});
    res.redirect('/');

  } catch (error) {
    console.log(error);
  }
});

module.exports = router;