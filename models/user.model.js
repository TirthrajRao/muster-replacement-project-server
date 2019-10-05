var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	email: {type: String},
	name : {type: String},
	password: {type: String},
	designation: {type: String},
	userRole : {type : String , default: 'employee'}
});
 

module.exports = mongoose.model('User' , UserSchema); 