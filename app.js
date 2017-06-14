var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');

var db = mongojs('customerapp', ['Users']);

var app = express();

//Middleware basic example
/*
var logger = function(req, res, next){
	console.log('Logging...');
	next();
}

app.use(logger);
*/
//Veiw Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Body Paser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Static path
app.use(express.static(path.join(__dirname, 'public')));


// Global vars
app.use(function(req,res,next){
	res.locals.errors = null;
	next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.get('/', function(req, res){
	db.Users.find(function (err, docs) {
	// docs is an array of all the documents in mycollection
		console.log(docs);
		res.render('index', {
			title: 'Customers',
			users: docs
		});
	})
	
});

// Add new users
app.post('/users/add', function(req, res){
	//console.log(req.body.first_name);

	req.checkBody('first_name', 'First Name is required ').notEmpty();
	req.checkBody('last_name', 'Last Name is required ').notEmpty();
	req.checkBody('email', 'Email is required ').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		console.log('ERRORS');
		res.render('index', {
			title: 'Customers',
			users: users,
			errors: errors
	});

	} else {
		var newUser = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email
		}
		//Add user to MongoDB
		db.Users.insert(newUser, function(err, result){
			if(err){
				console.log(err);
			}
			res.redirect('/');
		});
	}
	console.log(newUser);
});

app.listen(3000, function(){
	console.log('Server Started on port 3000...');
})

















