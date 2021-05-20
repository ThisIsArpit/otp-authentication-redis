const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');

const app = express();
const redis = require('redis');
const redis_port = '6379';
const redis_host = '127.0.0.1'; 
const client = redis.createClient(redis_port,redis_host);

nunjucks.configure('views', { express: app })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

client.on('connect', function(){
  console.log("connected");
});

app.get('/',(req,res) => {
    res.render('index.html', { message: 'OTP Aunthentication!' }) 
})

app.post('/verify',(req,res) =>{
    const otp = Math.floor(Math.random() * 10000);
    console.log("verifying", otp);
     client.set('otp_'+req.body.number, otp,'EX', 60 , function(err, reply) {
         console.log(reply, err);
         if(reply !== 'OK'){
            res.render('index.html');
            } else {
            res.render('check.html', {requestedPhoneNumber: req.body.number});
        }
     });
})

app.post('/check', (req, res) =>{
    const key = 'otp_'+req.body.requestedPhoneNumber;
    console.log(key);
    client.get(key, function(err, reply) {
        console.log(reply, err);
        if(reply !== req.body.code){
            res.render('index.html', { message: 'Authentication Failed! \n Please Try Again..' });
            console.log("not verified", err);
        } else {
            res.render('success.html');
            console.log("verified");
        }
    });


})

app.listen(3000)
