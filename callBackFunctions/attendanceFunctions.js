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
	}
}





module.exports = attendanceFunctions;