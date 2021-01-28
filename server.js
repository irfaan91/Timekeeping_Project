var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var session = require('express-session');

//middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({ 	secret: 'timekeeping',
					resave: true,
				    saveUninitialized: true}))

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');


//global storage variables
var defaultusers = [ {username: "admin", password: "admin", permission: 1},
					 {username: "Manager", password: "pass1", permission: 2},
					 {username: "John", password: "pass2", permission: 4},
					 {username: "Irfaan", password: "pass3", permission: 4}];
var site_database = [];
var tech_database = [];
var record_database = [];

//UTILITY FUNCTIONS

//adding data
//creates local copy to be reloaded at start of server
function addData(record){
	record_database.push(record);
	fs.writeFile("./database/data.json", JSON.stringify(record_database, null, 2), function(err){
		if(err){return console.log(err);}
	});
}

//reloading data from file storage
function loadData(){
	//clears current variable
	record_database = [];
	var obj;
	fs.readFile("./database/data.json", 'utf8', function (err, data) {
		if (err) throw err;
		obj = JSON.parse(data);
		for (var i = 0; i < obj.length; i++){
			record_database.push(obj[i]);
		}
	});
}

//get date returns day/month/year in string format
function getDate(){
	var curr_date = new Date();
	var curr_day = curr_date.getDate();
	var curr_month = (curr_date.getMonth()+1);
	var curr_year = curr_date.getFullYear();
	return (curr_day + "/" + curr_month + "/" + curr_year);
}

//get time returns the current time in ampmstring format
function getTime(){
	var curr_date = new Date();
	var curr_hour = curr_date.getHours();
	var curr_min = curr_date.getMinutes();
	var ampm = "PM";
	if (curr_hour < 12){
		ampm = "AM";
		if(curr_hour == 0){
			curr_hour = 12;
		}
	}else{
		if (curr_hour > 12){
			curr_hour = curr_hour - 12;
		}
	}
	return (curr_hour + ":" + curr_min + ampm);
}










//GET FUNCTIONS

//defualt page
//makes login homepage
app.get('/', function (req, res) {
	res.redirect('/login');
});

//main login page
app.get('/login', function (req, res) {
    res.render('login', { title: 'Login', site_number: '0101' });
});

//logout page
app.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/login');
});


//main user page
app.get('/mainpage', function (req, res) {
	if (req.session.permission<=2){
		res.redirect('/dashboard');
	}else{	
		if (req.session.permission<=5){
			res.render('main_page', { title: 'Main Page' , clockedin: req.session.clockedin, site: req.session.location});
		}else{
			res.redirect('/login');
		}
	}
});

//site notes page
app.get('/notes', function (req, res) {
	if (req.session.permission<=4){
    	res.render('edit_notes', { title: 'Edit Site Notes' });
	}else{
		res.redirect('/login');
	}
});

//manager dashboard page
app.get('/dashboard',function (req, res){
	if (req.session.permission<=2){
		res.render('dashboard', { title: 'Manager Dashboard'});
	}else{
		res.redirect('/login');
	}
});

//view timesheet page
app.get('/view_timesheet', function (req, res) {
	if (req.session.permission<=2){
    	res.render('manager_view_timesheet', { title: 'Timesheet' });
	}else{
		res.redirect('/login');
	}
});

//clockin function
app.get('/clockin', function (req, res) {
	var clock_record = {	tech : req.session.user,
							date : getDate(),
							time : getTime(),
							type: 'IN',
							location: req.session.location
	};
	addData(clock_record);
	console.log(record_database);
	//console.log(req.session.user+" "+ getDate() +" "+getTime() +" @ " + req.session.location);
	req.session.clockedin = true;
    res.redirect('/mainpage');
});


//clockout/logout function
app.get('/clockout', function (req, res) {
	var clock_record = {	tech : req.session.user,
							date : getDate(),
							time : getTime(),
							type: 'OUT',
							notes: '',
							picture: '',
							location: req.session.location
	};
	addData(clock_record);
	console.log(record_database);
    res.redirect('/logout');
});

//view/edit function
app.get('/edit_notes', function (req, res) {
	if (req.session.permission<=4){
    	res.render('view_timesheet', { title: 'Timesheet' });
	}else{
		res.redirect('/login');
	}
});



//LISTENER
app.listen(app.get('port'), function() {
	loadData();
	console.log('Server listening on port ' + app.get('port'));
});



//POST FUNCTIONS

//post login
//loops through current users and see if account exists and if username and password matches.
app.post('/login', function (req, res) {
	var loggedin = false;
	for (var i = 0; i < defaultusers.length; i++){
		if((req.body.username == defaultusers[i].username) && (req.body.password == defaultusers[i].password)){
			req.session.user = defaultusers[i].username;
			req.session.permission = defaultusers[i].permission;
			req.session.location = req.body.location;
			req.session.clockedin = false;
			loggedin = true;
			res.redirect('/mainpage');
		}
	}
	if(!loggedin){
		//if no user is found and matched then re-render login page
		res.redirect('/login');
	}
});