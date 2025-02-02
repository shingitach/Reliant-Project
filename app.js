const express = require('express'); 
//This line imports the Express framework by requiring the 'express' module.  
// The express variable now holds the reference  to the Express application.
const app = express(); 
// This line creates an instance of the Express application.  
// The 'app' variable is used to configure and control the server.


const session = require('express-session');

var conn = require('./dbConfig');
//setting connection the db

app.set('view engine','ejs'); 
// configures Express to use  EJS as the view engine. 
// EJS allows us to embed JavaScript code directly in our HTML templates. 
var bodyParser = require('body-parser');

app.use(session({
    secret: 'yoursecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 // sets the cookie to expire in 1 minute
      }
    
}));
//creates the db login session
app.use(express.json()); 
//app.use(express.urlencoded({ extended: true}));
app.use('/public', express.static('public'));
app.use('/js', express.static('js'));
// This uses the public external css settings for paragraphs and header style/fonts

// Body parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
var flash = require('req-flash');
app.use(flash());
app.get('/', function (req, res){ 
           res.render("home"); 
}); 
// This code sets up a route for the  root URL ('/') using the app.get method. 
// When a request is made to the root URL,  it renders the "home.ejs" template  using res.render("home").
app.get('/home', function (req, res){ 
    res.render("home"); 
}); 
app.get('/login', function(req, res){ //takes a request and sends a response    
    res.render('login');
});

app.post('/auth', function(req, res){
    let email = req.body.email;
    let password = req.body.password;
    if (email && password){
        conn.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0 && results[0].password === password) {
                req.session.loggedin = true;
                req.session.email = email;
                res.redirect('/membersOnly');
            } else {
                res.send('Incorrect Email and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Email and Password!');
        res.end();
    }
});

app.post('/bookings', (req, res) => {
    const {
        fullName,
        email,
        mobile,
        checkinDate,
        checkoutDate,
       // noOfAdults,
       // noOfChildren,
        //noOfInfants,
       // noOfPets,
        roomType,
       // roomNumber,
       // roomPrice,
       numberOfDays,
        Amount,
        //paymentMethod,
    } = req.body;

    if (!fullName || !email || !mobile || !checkinDate || !checkoutDate ||!roomType ||!Amount ||!numberOfDays) {
        res.status(400).send('Please fill out all fields!');
        return;
    }

    const INSERT = `INSERT INTO bookings (fullname, email, mobile, checkin, checkout,room_type, amount, days_num, customer_id) VALUES ("${fullName}", "${email}", "${mobile}", "${checkinDate}", "${checkoutDate}","${roomType}","${Amount}","${numberOfDays}","1")`;
    conn.query(INSERT, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error occurred while inserting record');
        } else {
            console.log('Record inserted successfully!, Your booking amount is : '+Amount+'$');
            res.redirect('/home');
        }
    });
});
app.get('/membersOnly', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('membersOnly');
    }
    else{
        res.send('Please login to view this page!');
    }
});

///Users can access this only when logged in
 app.get('/addMPs', function (req, res, next) {
    if (req.session.loggedin) { // or if (req.session.loggedin == true)
        res.render('addMPs');
    }
    else{
        res.send('Please login to view this page!');
    }
}); 
 


 
//This will send a POST request to '/register' which will store 
//the user information in a table.
app.post('/register', function(req, res) {
    let firstname = req.body.firstname;
    let surname = req.body.surname;
    let email = req.body.email;
    let password = req.body.password;
    let admin = req.body.admin === 'yes';
    let active = true;
    if (firstname && surname && email && password) {
        var sql = `INSERT INTO users (firstname, surname, email, password, admin, active) VALUES (?, ?, ?, ?, ?, ?)`;
        conn.query(sql, [firstname, surname, email, password, admin, active], function(err, result) {
            if (err) throw err;
            console.log('record inserted');
            res.render('login');
        })
    } else {
        console.log("Error");
    }
});
app.get('/bookings', function (req, res) {
    const sql = 'SELECT DISTINCT room_type FROM roomtypes';
    conn.query(sql, (err, rows) => {
        if (err) {
            console.error('Error executing query: ' + err.message);
            res.status(500).send({ message: 'Error fetching room types' });
        } else {
            
            res.render('bookings', { roomTyps: rows });
            
        }
        console.log(rows);
    });
});

app.get('/viewbookings', function(req, res, next){		
	conn.query("SELECT * FROM bookings ",  function (err, result) {
		if (err) throw err;
		console.log(result);		
		res.render('viewbookings',
		{ title: 'viewbookings', eData: result})					
	});     
});

//UPDATE BOOKINGS
app.get('/booking-update/(:id)', function(req, res, next){
	const sql = 'SELECT DISTINCT room_type FROM roomtypes';
    conn.query(sql, (err, rows) => {
        if (err) {
            console.error('Error executing query: ' + err.message);
            res.status(500).send({ message: 'Error fetching room types' });
        } else { 
			conn.query('SELECT * FROM bookings WHERE id = ' + req.params.id, function(err2, rows2, fields) {
				if(err2) throw err2			
				if (rows2.length <= 0) {
					req.flash('error', 'Reservation id not found = ' + req.params.id)
					res.redirect('/booking-update')
				}
				else { 

					res.render('booking-update', {				
						id: rows2[0].id,
						checkinDate: new Date (rows2[0].checkin).toISOString().split("T")[0],
						checkoutDate: new Date (rows2[0].checkout).toISOString().split("T")[0],
						numberOfDays: rows2[0].days_num,	
						amount: rows2[0].amount,
						email: rows2[0].email,
						roomType: rows2[0].room_type,
						fullname: rows2[0].fullname,
						mobile: rows2[0].mobile,
						roomTyps: rows
					})
				}
			});		
		}
	});
});

//UPDATE BOOKINGS

app.post('/booking-update/(:id)', function(req, res, next) {    
    var booking = {            
        checkin: req.body.checkinDate,
        checkout: req.body.checkoutDate,
        days_num: req.body.numberOfDays,
        amount: req.body.amount,
        email: req.body.email,
        room_type: req.body.roomType,
        fullname: req.body.fullname,
        mobile: req.body.mobile

    }        
    const query = 'UPDATE bookings SET ? WHERE id = ?';
    conn.query(query, [booking, req.params.id], function(err, result) {
        if(err) {
            console.error(err);
           req.flash('error', 'Error updating booking');
            res.redirect("/bookings");
        } else {
          req.flash('success', 'Reservation updated successfully!');
            res.redirect("/viewbookings");
        }
    });    
});


 
//DELETE BOOKINGS
app.post('/delete/(:id)', function(req, res, next) {
	var booking = { id: req.params.id }		
	conn.query('DELETE FROM bookings WHERE id = ?', [req.params.id], function(err, result) {
		if (err) {
		
			req.flash('error', 'Error deleting reservation: ' + err.message);
			res.redirect('/viewbookings');
		} else {
			console.log(req.flash('success'));
			req.flash('success', 'Reservation deleted successfully!');
			res.redirect('/viewbookings');
		}
	});	
});
// Assuming you're using Express and a MySQL database connection

app.get('/get-room-price/:roomTypeId', (req, res) => {
    const roomTypeId = req.params.roomTypeId;
  
    const query = 'SELECT price FROM roomtypes WHERE room_id = ?';
    conn.query(query, [roomTypeId], (err, results) => {
      if (err) {
        console.error('Error fetching room price:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Room type not found' });
      }
  
      const price = results[0].price;
      res.json({ price });
    });
  });
  
/* app.get('/listMPs', function (req, res){
    conn.query("SELECT * FROM mps", function(err, result) {
        if (err) throw err;
        console.log(result);
        res.render('listMPs', { title: 'List of NZ MPs', MPsData:result});
    });
}); */



app.get('/contactus',function (req, res){
     res.render("contactus");
});

 app.get('/bookings',function (req, res){
    res.render("bookings") 
});
app.get('/logout',(req,res) =>{
    req.session.destroy(); // since a sesssion is created when user logs in destroy the session
    res.redirect('/');
}); 
app.listen(3100); 
// This line makes the Express application  listen on port 3000 for incoming requests. 
// It starts the server and makes it ready  to handle HTTP requests. 
// The listen method takes the port number (3000 in this case) as an argument. 
console.log('Node app is running on port 3100');