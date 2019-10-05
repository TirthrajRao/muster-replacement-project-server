var attendanceModel = require('../models/attendance.model');
var userModel = require('../models/user.model');
var moment = require('moment');
var take_attendance = {};
const ObjectId = require('mongodb').ObjectId;
var attendanceFunction = require('../callBackFunctions/attendanceFunctions');
var macfromip = require('macfromip');
const os=require('os');  



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
			attendanceModel.findOne({userId: req.body.userId , date: moment(new Date()).format("DD/MM/YYYY")})
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
						presentTime = moment().format('h:mm:ss a'); 
						console.log("the persent time whewn we add the new attendence ========>" , presentTime);
						var arr = {
							in :  moment().format('h:mm:ss a')
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
						foundAttendence.timeLog[timeLogLength].out = moment().format('h:mm:ss a');
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
		}
	});
}

take_attendance.getAttendanceById =  function(req , res){
	if(req.body.days){
		console.log("You are in getAttendanceById function if days are given" , req.body.userId);
		console.log("From" , moment(new Date()).subtract(5,'d').format("DD/MM/YYYY"));
		console.log("To" , moment(new Date()).format("DD/MM/YYYY"));
		attendanceModel.aggregate([
		{
			$match : {  userId : ObjectId(req.body.userId)  } 	
		}
		])
		.sort({_id : -1})
		.limit(5)
		.exec((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				console.log("foundLogs of last five days" , foundLogs)
				res.send(foundLogs);
			}
		});
	}else{
		console.log("You are in getAttendanceById function" , req.body.userId);
		attendanceModel.aggregate(
			[ { $match : { date : moment(new Date()).format("DD/MM/YYYY")   , userId:ObjectId(req.body.userId) } ,  } ]
			)
		.exec((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				console.log("You are in getAttendanceById function" , foundLogs);
				res.send(foundLogs);
			}
		});
	}
}

take_attendance.getCurrentMonthLogCount = function(req , res){
	if(!req.body.date){
		date = moment(new Date()).format("DD/MM/YYYY").split("/")[1];
		date = new RegExp('\/'+ moment(new Date()).format("DD/MM/YYYY").split("/")[1] + '\/','g');
		console.log(date);
	}
	else{
		date = moment(req.body.date).format("DD/MM/YYYY").split("/")[1];
		date = new RegExp('\/'+ date + '\/','g');'\/'+ date + '\/';
		console.log(date);
	}
	console.log("IN the count =====>" , req.body.userId);
	attendanceModel.find( { date: { $regex: date } , userId : req.body.userId } )
	.sort({_id : 1})
		.exec((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				console.log("foundLogs of last five days count " , foundLogs.length);
				res.json({length : foundLogs.length});
			}
		});	
}
take_attendance.getCurrentMonthLogByPage = function(req , res){
	console.log("body of pagination " , req.body);
	if(!req.body.date){
		date = moment(new Date()).format("DD/MM/YYYY").split("/")[1];
		date = new RegExp('\/'+ moment(new Date()).format("DD/MM/YYYY").split("/")[1] + '\/','g');
		console.log(date);
	}else{
		date = moment(req.body.date).format("DD/MM/YYYY").split("/")[1];
		date = new RegExp('\/'+ date + '\/','g');'\/'+ date + '\/';
		console.log(date);
	}


	if(req.body && req.body == 'admin'){

	}else{
		var skip = 0;
		if(req.body.page == 1){
			skip = 0
		}else{
			skip = Number(req.body.page) * 5 - 5;
		}
		attendanceModel.find({ date: { $regex: date } , userId : req.body.userId})
		.sort({_id : -1})
		.limit(1 * 5)
		.skip(skip)
		.exec((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				console.log("foundLogs of last five days pagination" , foundLogs)
				res.send(foundLogs);
			}
		});	
	}
}
take_attendance.getTodaysattendance = function(req , res){
	attendanceModel.find({ date : moment(new Date()).format("DD/MM/YYYY")})
	.populate('userId')
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			userModel.find((err , totalUser)=>{
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



//imported 
take_attendance.getLogBySingleDate = function(req , res){
	attendanceModel.find({ date :  moment(req.body.firstDate).format("DD/MM/YYYY") })
	.populate('userId')
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			res.send(foundLogs);
		}
	});
}

take_attendance.getLogByName = function(req , res){
	console.log(req.params);

}

take_attendance.getLogsBetweenDates = function(req , res){
	console.log(req.body);
	attendanceModel.aggregate([
	{									
		$match : { date : { $gte: moment(req.body.firstDate).format("DD/MM/YYYY"), $lte : moment(req.body.secondDate).format("DD/MM/YYYY") } } 	
	},	
	{
		$group: {
			_id: "$Date",
			entry: {
				$push: "$$ROOT"
			}
		}
	}
	])
	.sort({_id : 1})
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			res.send(foundLogs);
		}
	});
}
take_attendance.getLogsByNameBySingleDate = function(req , res){
	console.log("getLogsByNameBySingleDate ==>" , req.body );
	attendanceModel.find({
		 date : { $eq: moment(req.body.firstDate).format("DD/MM/YYYY")} , userId : { $eq : req.body.id } 
	})
	.sort({_id : 1})
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			res.send(foundLogs);
		}
	});

}
take_attendance.getLogsByNameBetweenDates = function(req , res){
	console.log("getLogsByNameBetweenDates" , req.body);
	attendanceModel.find(
	{ date : { $gte: moment(req.body.firstDate).format("DD/MM/YYYY")  , $lte :  moment(req.body.secondDate).format("DD/MM/YYYY") } , userId : { $eq : req.body.id } })
	.sort({_id : 1})
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			res.send(foundLogs);
		}
	});
}

take_attendance.getReportById = function(req , res){
	console.log("In the success" , typeof req.body.startDate);
	attendanceModel.find(
		{ date : { $gte: req.body.startDate  , $lte :  req.body.endDate } , userId : { $eq : req.body.userId } }
	)
	.sort({_id : 1})
	.exec((err , foundLogs)=>{
		if(err){
			console.log("getting error in line 279",err);
			res.send(err);
		}else if(foundLogs.length){
			/*require('getmac').getMac(function(err, macAddress){
				if (err)  throw err
					console.log("macAddress ======>" , macAddress);
			});*/
			console.log("getting data on line 282", foundLogs);
			res.send(foundLogs);
		}else{
			console.log("getting nothing")
			res.send([]);
		}
	});
}

module.exports = take_attendance;