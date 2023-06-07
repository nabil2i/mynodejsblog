require('dotenv').config();
const main = require('./server/routes/main');
const admin = require('./server/routes/admin');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
// cookie-parser will grave, save,... cookies
const cookieParser = require('cookie-parser');
// to store sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')

const connectDB = require('./server/config/db');
const { isActiveRoute} = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 5000 || process.env.PORT;


// connect to db
connectDB();

// to past params in post request, forms
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
  // for seeing the cookie expiration time
  //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));
// public folder for JS images etc
app.use(express.static('public'));

// templating engine
app.use(expressLayout);
app.set('layout', './layouts/main'); // default layout
app.set('view engine', 'ejs'); // view engine is ejs

app.locals.isActiveRoute = isActiveRoute;

app.use('/', main);
app.use('/admin', admin);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})