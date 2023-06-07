
const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// routers
// with pagination
router.get('', async (req, res) => {

  try {
    const locals = {
      title: "NabilConveys Blog",
      description: "Conveying the message of God to all humanity!"
    }

    let perPage = 5;
    let page = req.query.page || 1;

    const data = await Post.aggregate([ { $sort: {createdAt: -1} }
      ]).skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    
    //const data = await Post.find();
    res.render('index', { 
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });
  } catch (error) {
    console.log(error);
  }

  // res.send("Hello mongo");
  // res.render('index', { locals});
});

router.get('/about', (req, res) => {
  // res.send("Hello mongo");
  res.render('about', { currentRoute: '/about'});
});

router.get('/contact', (req, res) => {
  // res.send("Hello mongo");
  res.render('contact', { currentRoute: '/contact'});
});



// // without pagination
// router.get('', async (req, res) => {
//   const locals = {
//     title: "NabilConveys Blog",
//     description: "Conveying the message of God to all humanity!"
//   }

//   try {
//     const data = await Post.find();
//     res.render('index', { locals, data });
//   } catch (error) {
//     console.log(error);
//   }

//   // res.send("Hello mongo");
//   // res.render('index', { locals});
// });


// post
router.get('/post/:id', async (req, res) => {
 
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
      description: "Conveying the message of God to all humanity!",
      currentRoute: `/post/${slug}`
    }

    
    res.render('post', { locals, data});
  } catch (error) {
    console.log(error);
  }

  // res.send("Hello mongo");
  // res.render('index', { locals});
});

// post for research
router.post('/search', async (req, res) => {
 
  try {
    const locals = {
      title: "Search",
      description: "Conveying the message of God to all humanity!"
    }

    let searchTerm = req.body.searchTerm // name
    //console.log(searchTerm);
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    
    const data = await Post.find({ 
      // do query 
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
      ]
    });

    //res.send(searchTerm);
    res.render('search', { locals, data })
  } catch (error) {
    console.log(error);
  }

  // res.send("Hello mongo");
  // res.render('index', { locals});
});



// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic."
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan."
//     },
//   ])
// }

// insertPostData();

module.exports = router;