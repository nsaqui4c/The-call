const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var nodemailer = require("nodemailer");
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


// Forget Password
router.get('/resetPassword',(req, res) => res.render('forgetPass'));

router.post('/resetPassword', (req, res) => {
  const {email} = req.body;
  console.log(email);
  let errors = [];

  if (!email) {
    errors.push({ msg: 'Please enter email' });
    console.log("no email entered: forgetpass");
  }
  if (errors.length > 0) {  
    res.render('forgetPass', {
      errors,
      email      
    });
  }

  else{
    User.findOne({ email: email }).then(user =>{
      if (user) {

        //creating  and hashing random password

        var newPAss           = '';
        var newPAssHash           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 8; i++ ) {
          newPAss += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        console.log(newPAss);

        bcrypt.genSalt(10, (err, salt)=>{
          bcrypt.hash(newPAss, salt, (err, hash) => {
            if (err) throw err;
            newPAssHash = hash;

             //random password ends
             
            console.log(newPAssHash);
            //updating password in db

        User.updateOne({email: email},{ $set: {password: newPAssHash}}, function(err, res) {
          if (err) throw err;
          console.log(`1 document updated: ${email}`);
        });
        
        //db updating end

        var mailOptions={
          from: '"Nodemailer Contact" <admin@thecall.co.in>', // sender address
          to : 'najmus.saquiballd@hotmail.com',
          subject : 'node test mail',
          text : 'You new password for thecall.co.in is :'+newPAss
      }
        //sending mail
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
       
           req.flash(
             'error_msg',
            'Error sending mail. Please try again'
           );
          res.redirect('/users/resetPassword');
         }else{
            console.log("Message sent: " + response.message);
             req.flash(
              'success_msg',
              'New password sent successfully to registered email'
            );
            res.redirect('/users/login');
          }
        });

          });
        });

       

        

        //setting mail options
        var smtpTransport = nodemailer.createTransport({
  
        host: 'mail.thecall.co.in',
        port: 26,
        secure: false,
        auth: {
            user: "admin@thecall.co.in",
            pass: "Thecall@1453"
        },
        //to send mail in local
        tls:{
         rejectUnauthorized:false
      }
      });

      


     // req.flash(
    //   'success_msg',
    //   'New password sent successfully to registered email'
    // );
    // res.redirect('/users/login');

    }//end of if user exist in db

    else {
      errors.push({ msg: 'Email does not exists' });
      res.render('forgetPass', {
        errors,
        email      
      });
    }// end of else 

    })
  }//end of else (if no error found in req)
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        security=password
        isSubscribed=false
        const newUser = new User({
          name,
          email,
          password,
          security,
          isSubscribed
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

//freecopy

router.get('/freecopy', ensureAuthenticated, (req, res) =>
    res.render('freecopy', {
    user: req.user
    })
);





// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
