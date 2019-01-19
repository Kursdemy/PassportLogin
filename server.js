var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser =  require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var ejs = require('ejs');
var engine = require('ejs-mate');
var passportConf = require('./passport');
var User = require('./models/user')

var app = express();

// Koneksi Database
mongoose.connect('mongodb://root:Samsung33@ds157544.mlab.com:57544/mongoose', {useNewUrlParser: true}, function(err){
    if (err){
        console.log(err);
    } else {
        console.log("Koneksi Database OK")
    }
});

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(session({
    resave: true, // to force session save to session store after modified or not selama request.
    saveUninitialized: true, // to save to store unitialize session.
    secret: 'Hello', // secret to sign session ID cookie.
    store: new MongoStore({ url: 'mongodb://root:Samsung33@ds157544.mlab.com:57544/mongoose' , autoReconnect: true})
}));

mongoose.set('useCreateIndex', true);

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res, next){
    res.render('home')
});

app.get('/login', function(req, res, next){
    if (req.user) return res.redirect('/')
    res.render('login')
});

app.get('/profile', function(req, res, next){
    res.render('profile')
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));

app.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
})

app.post('/create-user', function(req, res, next){
    var user = new User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.save(function(err){
        if (err) console.log(err)
        res.json(user);
    });
});

// Setup server
app.listen(3000, function(err){
    if (err){
        console.log(err);
    } else {
        console.log("Server Run port 3000")
    }
});