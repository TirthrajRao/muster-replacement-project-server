var attendanceModel = require('../models/attendance.model');
var userModel = require('../models/user.model');
var moment = require('moment');
var take_attendance = {};
const ObjectId = require('mongodb').ObjectId;
var attendanceFunction = require('../callBackFunctions/attendanceFunctions');
var macfromip = require('macfromip');
const os=require('os');  
const momentTimeZone = require('moment-timezone');
moment.tz.add("Asia/Calcutta|HMT BURT IST IST|-5R.k -6u -5u -6u|01232|-18LFR.k 1unn.k HB0 7zX0");
moment.tz.link("Asia/Calcutta|Asia/Kolkata");



take_attendance.fillAttendance = function(req , res){
	console.log("os.networkInterfaces(): \n",os.networkInterfaces());   
	macfromip.getMac('192.168.1.31', function(err, data){
		if(err){
			console.log(err);
		}
		console.log(data);
	});	
	// require('getmac').getMac(function(err, macAddress){
	// 	if (err)  throw err
	// 		console.log("macAddress ======>" , macAddress);
	// });
	console.log("req body of fill attendence " , req.body);
		userModel.findOne({_id : req.body.userId} , (err , foundUser)=>{
			console.log("found user");
		if(err){
			console.log("error  in finding student" , err);
			res.status(400).send(err);
		}
		else{
			console.log("working");
			var date = new RegExp( moment().toISOString().split("T")[0],'g');
			// bwlow code works
			// console.log("Date ==============+++++>" , moment(new Date()));
			console.log("Date ==============+++++>" , new Date().toISOString() , "Only Fsyr ====>" , date);
			var newDate = new Date().toISOString().split("T")[0] + "T18:30:00.000Z";
			try{
			attendanceModel.findOne({userId: req.body.userId , date: newDate})
			.populate('userId')
			.exec( async (err , foundAttendence)=>{
				if(err){
					res.status(500).send(err);
				}
				else if(foundAttendence != null){
					console.log(" foundAttendence ======>" , foundAttendence)
					var timeLogLength = foundAttendence.timeLog.length - 1;
					var lastRecord = foundAttendence.timeLog[timeLogLength].out;
					if(lastRecord !="-"){
						presentTime = moment().tz("Asia/Calcutta|Asia/Kolkata").format('h:mm:ss a'); 
						console.log("the persent time whewn we add the new attendence ========>" , presentTime);
						var arr = {
							// in :  moment().tz("Asia/Calcutta|Asia/Kolkata").format('h:mm:ss a')
							in :  moment().utcOffset("+05:30").format('h:mm:ss a')
						};
						foundAttendence.status = "Present";
						foundAttendence.timeLog.push(arr);
						foundAttendence.absentCount = Number(foundAttendence.absentCount) + 1; 
						attendanceModel.findOneAndUpdate({_id: foundAttendence._id} , {$set: foundAttendence} , {upsert: true, new: true} , (err , updatedAttendence)=>{
							if(err){
								res.status(500).send(err);
							}else{
								var arr = [];
								arr.push(updatedAttendence)
								res.status(200).send(arr);
							}
						});
					}
					else{
						foundAttendence.timeLog[timeLogLength].out = /*moment().tz("Asia/Calcutta|Asia/Kolkata").format('h:mm:ss a')*/moment().utcOffset("+05:30").format('h:mm:ss a');
						foundAttendence = await attendanceFunction.calculateDifference(foundAttendence , timeLogLength);
						attendanceModel.findOneAndUpdate({date: foundAttendence.date , userId: foundAttendence.userId._id} , {$set: foundAttendence} , {upsert: true , new: true} , (err , updatedLog)=>{
							if(err){
								res.status(500).send(err);
							}
							else{
								var arr = [];
								arr.push(updatedLog)
								res.status(200).send(arr);	
							}
						});
					}
				}
				else{
					req.body =  await attendanceFunction.newAttendance(req.body);
					var attendence = new attendanceModel(req.body);
					attendence.save((err , savedAttendence)=>{
						if(err){
							res.status(500).send(err);
						}
						else{
							console.log(savedAttendence);
							var arr = [];
							arr.push(savedAttendence)
							res.status(200).send(arr);
						}
					});
				}
			});

			}catch(e){
			console.log(e)	
		}
		}
	});
}

take_attendance.getAttendanceById =  function(req , res){
	console.log("Inside getAttendanceById ==========+++>" , req.body);
	if(req.body.days){
		console.log("You are in getAttendanceById function if days are given" , req.body.userId);
		var someDate = new Date();
		var numberOfDaysToAdd = -5;
		someDate.setDate(someDate.getDate() + numberOfDaysToAdd); 
		console.log("to" , new Date().toISOString().split("T")[0] + "T18:30:00.000Z");
		console.log("from" , someDate.toISOString().split("T")[0] + "T18:30:00.000Z");
		var from = someDate.toISOString().split("T")[0] + "T18:30:00.000Z";
		var to =  new Date().toISOString().split("T")[0] + "T18:30:00.000Z"
		// console.log("From" , moment(new Date()).subtract(5,'d').format("DD/MM/YYYY"));
		// console.log("To" , moment(new Date()).format("DD/MM/YYYY"));
		attendanceModel.find(
			{ date : { $gte: from  , $lte :  to } , userId : { $eq : req.body.userId } }
		)
		/*.sort({_id : -1})
		.limit(5)*/
		.exec(async(err , foundLogs)=>{
			if(err){
				res.send(err);
			}else if(foundLogs.length){
				// console.log("foundLogs of last five days IF =======++>" , foundLogs)
				var got = await  attendanceFunction.calculateTimeLog(foundLogs , 5 , foundLogs[0].date , foundLogs[foundLogs.length - 1].date);
				// console.log("Got ==========================>" , got);

				console.log("Found logs of get Attendance By Id" , foundLogs);
				res.json({
					"foundLogs" : foundLogs,
					"TotalHoursCompleted" : got.TotalHoursCompleted,
					"TotalHoursToComplete" : got.TotalHoursToComplete
				});
				// res.send(foundLogs);
			}else{
				res.json({"message" : "No logs found"})
			}
		});
	}else{
		var newDate = new Date().toISOString().split("T")[0] + "T18:30:00.000Z";
		console.log("You are in getAttendanceById function" , req.body.userId);
		attendanceModel.find( { date :  newDate   , userId: req.body.userId} 
		)
		.exec((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				console.log("You are in getAttendanceById function else ***************" , foundLogs);
				res.send(foundLogs);
			}
		});
	}
}

take_attendance.getCurrentMonthLogCount = function(req , res){
	
	return(res.send("100"));
}
take_attendance.getCurrentMonthLogByPage = function(req , res){
	console.log("body of pagination " , req.body);
	if(!req.body.date){
		console.log( new Date().toISOString().split("T")[0]/* + "T18:30:00.000Z"*/);
		date =  moment(req.body.date).format("DD/MM/YYYY").split("/")[2] + "-" + moment(req.body.date).format("DD/MM/YYYY").split("/")[1] 	;
		date = new RegExp( date , 'g');
		// date = "/"+date+"/"
		console.log(date);
	}else{
		console.log(moment(req.body.date).format("DD/MM/YYYY").split("/"));
		date = moment(req.body.date).format("DD/MM/YYYY").split("/")[1] + "-"+ moment(req.body.date).format("DD/MM/YYYY").split("/")[2];
		date = new RegExp('\/'+ date + '\/','g');
		console.log(date);
	}


	if(req.body && req.body == 'admin'){
		console.log("ADMIN");
	}else{
		console.log("EMPLOYEE");
		var skip = 0;
		if(req.body.page == 1){
			skip = 0
		}else{
			skip = Number(req.body.page) * 5 - 5;
		}
		attendanceModel.find({userId : req.body.userId})
		.sort({_id : -1})
		.limit(1 * 5)
		.skip(skip)
		.exec(async(err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				// foundLogs = foundLogs.filter(function(obj){
				// 	console.log(" ================++> " , obj.date.toISOString())
				// 	if(obj.date.toISOString().match(date)){
				// 		return obj;
				// 	}
				// });
				var got = await  attendanceFunction.calculateTimeLog(foundLogs , 5 , foundLogs[0].date , foundLogs[foundLogs.length - 1].date);
				// console.log("Got ==========================>" , got);


				res.json({
					"foundLogs" : foundLogs,
					"TotalHoursCompleted" : got.TotalHoursCompleted,
					"TotalHoursToComplete" : got.TotalHoursToComplete
				});
				// res.send(foundLogs);
			}
		});	
	}
}



//imported 
//Not needed 
take_attendance.getLogByName = function(req , res){
	console.log(req.params);

}

take_attendance.getLogBySingleDate = function(req , res){
	// console.log(" ==========+++++>getLogBySingleDate " , new Date(req.body.firstDate).toISOString().split("T")[0] + "T18:30:00.000Z");
	attendanceModel.find({ date :  new Date(req.body.firstDate).toISOString().split("T")[0] + "T18:30:00.000Z" })
	.populate('userId')
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			res.send(foundLogs);
		}
	});
}

take_attendance.getTodaysattendance = function(req , res){
	var newDate = new Date().toISOString().split("T")[0] + "T18:30:00.000Z";
	attendanceModel.find({ date : newDate })
	.populate('userId')
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			userModel.find({userRole : { $ne : 'admin' }})
			.exec((err , totalUser)=>{
				if(err){
					res.status(500).send(err);
				}else{
					console.log("You are in getAttendanceById function" , foundLogs);
					res.json({data :foundLogs , presentCount : foundLogs.length , totalUser : totalUser.length});
				}

			});
		}
	});	
}
take_attendance.getReportById = function(req , res){
	if(!req.body.flag){
		console.log("In the success" ,  req.body);
		var part = req.body.startDate.split("T")[1];
		endDate = req.body.endDate.split("T")[0];
		endDate = endDate + "T"  + part;
	}else{
        endDate = req.body.endDate +  "T18:30:00.000Z"; ;
        req.body.startDate = req.body.startDate +  "T18:30:00.000Z";
    }

	console.log("In the success" ,  req.body.startDate , endDate);
	attendanceModel.find(
		{ date : { $gte: req.body.startDate  , $lte :  endDate } , userId : { $eq : req.body.userId } }
	)
	.sort({_id : 1})
	.exec(async (err , foundLogs)=>{
		if(err){
			console.log("getting error in line 302",err);
			res.send(err);
		}else if(foundLogs.length){
			// console.log("getting data on line 282", foundLogs);
			// var momentObj = moment(req.body.startDate);
			var StartingDate = moment(req.body.startDate);
			var momentObjEnd = moment(endDate);
			// var momentObjend = moment(momentObj).format('YYYY-MM-DD ');
			// console.log("getting data on line 282" ,momentObjStrart , momentObjend);
        	var resultHours = momentObjEnd.diff(StartingDate, 'days');
        	// console.log("result hours ===========++>", resultHours);
        	// var resultHours = endDate.diff(req.body.startDate, 'days', true);
			var got = await  attendanceFunction.calculateTimeLog(foundLogs , resultHours , req.body.startDate , endDate);
			// console.log("Got ==========================>" , got);

			got['foundLogs'] = foundLogs;
			res.send(got);
		}else{
			console.log("getting nothing")
			res.send([]);
		}
	});
}

module.exports = take_attendance;