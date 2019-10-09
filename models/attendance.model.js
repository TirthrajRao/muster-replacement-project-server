var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AttendenceSchema = new Schema({
	userId: { type: Schema.Types.ObjectId , ref: 'User' , autopopulate: true},
	date: {type: Date},
	status: {type: String , default: "absent"},
	diffrence: {type: String , default: "-"}, 
	timeLog: [{
		in : {type: String , default: null},
		out: {type: String , default: "-"},
		_id : false
	}],
	absentCount: {type: String , default: null},
	day : {type : String} 
});
AttendenceSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Attendence' , AttendenceSchema ); 
