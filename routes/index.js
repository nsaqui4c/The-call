const express = require('express');
const router = express.Router();
var nodemailer = require("nodemailer");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
//router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/',(req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

//mail send

/* var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
      user: "najmus.saquib007@gmail.com",
      pass: "irshadnabi"
  }
}); */


var smtpTransport = nodemailer.createTransport({
  
  host: 'mail.thecall.co.in',
  port: 26,
  secure: false,
  auth: {
      user: "admin@thecall.co.in",
      pass: "Thecall@1453"
  },
  tls:{
    rejectUnauthorized:false
}
});

router.get('/send',(req,res)=>{

    var mailOptions={
    from: '"Nodemailer Contact" <admin@thecall.co.in>', // sender address
    to : 'najmus.saquiballd@hotmail.com',
    subject : 'node test mail',
    text : 'node test mail'
}

smtpTransport.sendMail(mailOptions, function(error, response){
  if(error){
         console.log(error);
     res.end("error");
  }else{
         console.log("Message sent: " + response.message);
     res.send("sent");
      }
});




});

module.exports = router;
