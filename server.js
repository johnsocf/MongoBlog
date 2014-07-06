var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose');

app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(session({secret: 'my secret',
				 saveUninitialized: true,
				 resave: true}));

app.set('view engine', 'jade');

app.use(function (req, res, next) {
	if (req.session.loggedIn) {
		res.locals.authenticated = true;
		console.log(req.session.loggedIn);
		User.findById( req.session.loggedIn, function (err, item) {
			if (err) return next(err);
			if (item) {
				var myName = item.first;
				var last = item.last;
				console.log(myName);
				res.locals.me = myName;
				res.locals.last = last;
				next();
			}
			console.log(item);
		});
	} else {
		 res.locals.authenticated = false;
		 next();
	}
});

app.get('/', function (req, res) {
	res.render('index');
});

app.get('/signup', function (req, res) {
	res.render('signup');
});

app.post('/signup', function (req, res, next) {

	var user = new User(req.body.user);
	user.save(function (err) {
		if (err) return next(err);
		res.redirect('/login/' + user.email);
	});
});

app.get('/login/:signupEmail', function (req, res) {
  res.render('login', { signupEmail: req.params.signupEmail });
});

app.post('/login', function (req, res, next) {
	setTimeout(function() {

    // Fetch the document
    User.findOne({email: req.body.user.email, password: req.body.user.password}, function(err, item) {
      if (err) return next(err);
      if (!item) { console.log('<p>User not found. Go back and try again'); }
      else {
      	req.session.loggedIn = item._id.toString();;
      	res.redirect('/');
      	console.log(req.session.loggedIn);
      }
      
    })
  }, 100);
});

app.get('/logout', function (req, res) {
	req.session.loggedIn = false;
	res.redirect('/');
});

// connect to the database
mongoose.connect('mongodb://127.0.0.1/my-website');

app.listen(3000, function () {
  console.log('\033[96m + \033[39m app listening on *:3000');
});

// define the model.

var Schema = mongoose.Schema

var User = mongoose.model('User', new Schema ({
	first: String,
	last: String,
	email: {type: String, unique: true},
	password: {type: String, index: true}
}));