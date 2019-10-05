var express = require('express');

var userController = require('../controllers/user.controller');

var router = express.Router();


router.post('/signup' , userController.signUp); 
router.post('/login' , userController.login);
router.get('/get-users' , userController.getUsers);
router.get('/get-user-by-id/:id' , userController.getUserById);
router.put('/update-user-by-id' , userController.updateUserById);
router.delete('/delete-user-by-id' , userController.deleteUserById); 

module.exports = router;
