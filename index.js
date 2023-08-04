
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const path = require('path');
// require("dotenv").config()
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const auth = require('./models/middleware'); 
const functions = require('./models/functions');
const DB = process.env['DB_SECRET']
mongoose.set("strictQuery", false); 
mongoose.connect(DB);

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views')); 
app.use(express.json())
app.use(express.static(__dirname + '/public')); 
app.use(cookieParser());


app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60*1000 }, // Session expires after 1 minut 
  })
);



app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get("/signup", (req, res) => {
  res.render('signup') 
});  

app.get("/forgot", (req, res) => { 
  res.render('forgot')
}); 
app.get("/about", (req, res) => { 
  res.render('about')
}); 

app.get("/", functions.handleIndex)
app.post('/upload', auth, functions.handleFileUpload);
app.post('/update',auth,functions.handleUpdation)
app.get('/board',functions.showLeathorboard)
app.post("/login", functions.handleLogin)
app.get("/profile", auth, functions.showProfile);
app.get("/dashboard", auth , functions.showDashBoard)
app.post("/reset",functions.handlePasswordReset); 
app.get('/reset/:token',functions.renderResetPage);
app.post('/reset/:token',functions.resetPassword);
app.post('/checkcode',functions.checkReferralCode)
app.get('/delete',functions.delteUser)
app.post('/signup', functions.signUP);

app.get('/referral',(req,res)=>{
  const code = Number(req.query.id);
  res.render('signup', { code });
})

app.listen(port, (e) => {
if (e) {console.error(e)}
console.log("Started");});
