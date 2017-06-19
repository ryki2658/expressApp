var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');

var db = mongojs('workOrderApp', ['Jobs']);

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
	db.Jobs.find(function (err, docs) {
	// docs is an array of all the documents in mycollection
		console.log(docs);
		res.render('index', {
			title: 'Jobs',
			jobs: docs
		});
	});
	
});

// Table of jobs in workOrderApp collection
app.get('/tables', function(req, res){
	db.Jobs.find(function(err, docs){
		res.render('tables', {
			title: 'Tables',
			jobs: docs
		});
	});
});

// Add new users
app.post('/jobs/add', function(req, res){
	//console.log(req.body.first_name);

	req.checkBody('job_id', 'Job Id is required ').notEmpty();
	req.checkBody('job_location', 'Job Location is required ').notEmpty();
	req.checkBody('job_description', 'Job Description is required ').notEmpty();
	req.checkBody('job_notes', 'Job Notes is required ').notEmpty();

	var errors = req.validationErrors();
	db.Jobs.find(function (err, docs) {
		if(errors){
			console.log('ERRORS');
			res.render('index', {
				title: 'Jobs',
				jobs: docs,
				errors: errors
		});

		} else {
			console.log('newjob');
			var newJob = {
				job_id: req.body.job_id,
				job_location: req.body.job_location,
				job_description: req.body.job_description,
				job_notes: req.body.job_notes,
				job_date: req.body.job_date
			}
			//Add user to MongoDB
			db.Jobs.insert(newJob, function(err, result){
				if(err){
					console.log(err);
				}
				res.redirect('/');
			});
		}
		console.log(newJob);
	});
});
app.listen(3000, function(){
	console.log('Server Started on port 3000...');
})

















