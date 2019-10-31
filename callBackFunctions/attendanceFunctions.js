const moment = require('moment');



const attendanceFunctions = {
	newAttendance : function(body){
		console.log("body in new attendence ===============+>" , body);
		body = {
			day : moment(new Date(), "YYYY-MM-DD HH:mm:ss").format('dddd'),
			time:  moment().utcOffset("+05:30").format('h:mm:ss a'),
			status: "Present",
			userId : body.userId,
			date : new Date().toISOString().split("T")[0] + "T18:30:00.000Z",
			timeLog : {
				in : moment().utcOffset("+05:30").format('h:mm:ss a')
			}
		}
		console.log("proper working =======> body " , body);
		return body;
	},
	calculateDifference : function(foundAttendence , timeLogLength){
		console.log("**************************** " , foundAttendence);
		var in1 = foundAttendence.timeLog[timeLogLength].in;
		var out = foundAttendence.timeLog[timeLogLength].out;
		var inn =  moment(in1, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');		
		var outt =  moment(out, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds');		
		console.log("in time ==>", in1 , " seconsds ===>" , inn);
		console.log("out time ==>", out , "seconsds==>" , outt);
		seconds = outt - inn;
		if(foundAttendence.diffrence != "-"){
			var diffrence = moment(foundAttendence.diffrence, 'hh:mm:ss: a').diff(moment().startOf('day'), 'seconds'); 	
			console.log("diffrence ======>" , diffrence);
			seconds = seconds + diffrence;
		}
		console.log("seconds ====>" , seconds);
		seconds = Number(seconds);
		var h = Math.floor(seconds / 3600);
		var m = Math.floor(seconds % 3600 / 60);
		var s = Math.floor(seconds % 3600 % 60);

		var time =  ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);

		console.log("time ==========+>"  , time);
		foundAttendence.diffrence = time;
		foundAttendence.status = "Absent";
		return foundAttendence;
	},
	calculateTimeLog : function(array , resultHours, start , end){
		var workingHours = 0;
		var totalHours = 0;
		var totalHoursToWork;
		var totalHoursWorked;
		// console.log("start ========+++>" , start._d , "end ==>" , end._d);
		console.log("result hours =========>" , resultHours);
		if(resultHours < 1)
			resultHours = 1	
		for(var i = 0 ; i< Math.ceil(resultHours) ; i++){
			console.log(resultHours - i);
			var local = moment(start._d).subtract(i, 'days');
			local =  moment(local._d , "YYYY-MM-DD HH:mm:ss").format('dddd');
			// console.log("add date ====>" , moment(start._d).subtract(i, 'days')._d  , "local ady" ,local);
			totalHours = totalHours + 30600; 
		}
		array.forEach((obj)=>{
			// console.log(obj);
			if(obj.diffrence){
				workingHours = workingHours + moment.duration(obj.diffrence).asSeconds();
				console.log("workingHours ====>" , workingHours);
			}
		});
		//calculate total working hours 
		var minutes = Math.floor(totalHours / 60);
		totalHours = totalHours%60;
		var hours = Math.floor(minutes/60)
		minutes = minutes%60;
		console.log("totalHours ====>" , hours , minutes);
		totalHoursToWork =  hours+":"+minutes+":"+"00";
		//calculate hours worked 
		
		var minutes = Math.floor(workingHours / 60);
		workingHours = workingHours%60;
		var hours = Math.floor(minutes/60)
		minutes = minutes%60;
		totalHoursWorked = hours+":"+minutes+":"+"00";
		console.log("total hours attednent ====>" , totalHoursToWork);
		console.log("total hours to attendnace====>" , totalHoursWorked);
		var obj = {
			"TotalHoursCompleted" : totalHoursWorked,
			"TotalHoursToComplete" : totalHoursToWork
		}
		return obj

	}
}





module.exports = attendanceFunctions;