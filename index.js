const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const http = require("http");
const path = require("path");
const https = require('https');
const fs = require('fs');


//import controllers
const takeAttendanceRoutes = require('./routes/take-attendance.js')
const userRoutes = require('./routes/user');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//https server
// const port = 4000;
// var privateKey = fs.readFileSync('/var/www/html/attendence/ssl/privkey1.pem');
// var certificate = fs.readFileSync('/var/www/html/attendence/ssl/fullchain1.pem');
// var credentials = {key: privateKey, cert: certificate};
// const secureServer = https.createServer(credentials,app);
// secureServer.listen(port);
// console.log("secure server started on 4000");

mongoose.connect('mongodb://localhost:27017/muster_logs', {useNewUrlParser: true , useUnifiedTopology: true}  )
.then(() => console.log("Congratulations you are connected to Database"))
.catch(err => console.log(err));

app.use('/attendance' , takeAttendanceRoutes);
app.use('/user' , userRoutes);



app.listen(4000);





