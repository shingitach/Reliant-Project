var express = require('express'); 
//This line imports the Express framework by requiring the 'express' module.  
// The express variable now holds the reference  to the Express application.
var app = express(); 
// This line creates an instance of the Express application.  
// The 'app' variable is used to configure and control the server.
var session = require('express-session');
var conn = require('./dbConfig');
//setting connection the db
app.set('view engine','ejs'); 
// configures Express to use  EJS as the view engine. 
// EJS allows us to embed JavaScript code directly in our HTML templates. 
var bodyParser = require('body-parser');

app.use(session({
    secret: 'yoursecret',
    resave: true,
    saveUninitialized: true
}));
//creates the db login session
app.use(express.json()); 
//app.use(express.urlencoded({ extended: true}));
app.use('/public', express.static('public'));
// This uses the public external css settings for paragraphs and header style/fonts

// Body parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
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
        //roomType,
       // roomNumber,
       // roomPrice,
        //totalAmount,
        //paymentMethod,
    } = req.body;

    if (!fullName || !email || !mobile || !checkinDate || !checkoutDate) {
        res.status(400).send('Please fill out all fields!');
        return;
    }

    const INSERT = `INSERT INTO bookings (fullname, email, mobile, checkin, checkout, customer_id) VALUES ("${fullName}", "${email}", "${mobile}", "${checkinDate}", "${checkoutDate}","1")`;
    conn.query(INSERT, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error occurred while inserting record');
        } else {
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
 

/* app.post("/addMps", function(req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let party = req.body.party;
    const insert = `INSERT INTO mps (id, name, party) VALUES ("${id}", "${name}", "${party}")`;
    conn.query(insert, function(err, result) {
        if(err) throw err;
        console.log('record inserted');
        res.send('Mp Added')
    })
   res.send(id+" "+name+" "+party)
 
}) */
 
 
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