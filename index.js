const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const http = require("http");
const path = require("path");
const https = require('https');



//import controllers
const takeAttendanceRoutes = require('./routes/take-attendance.js')
const userRoutes = require('./routes/user');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/muster_logs', {useNewUrlParser: true , useUnifiedTopology: true}  )
.then(() => console.log("Congratulations you are connected to Database"))
.catch(err => console.log(err));

app.use('/attendance' , takeAttendanceRoutes);
app.use('/user' , userRoutes);



app.listen(6000);