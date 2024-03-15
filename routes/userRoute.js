const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post('/createUser',userController.createUser)
router.get('/getUsersList',userController.getUsersList)
router.get('/getUserById/:id',userController.getUserById)
router.put('/updateUserById/:id',userController.updateUserById)
router.post('/userLogin',userController.userLogin)
router.get('/countUsers',userController.countUsers)
router.delete('/deleteUserById/:id',userController.deleteUserById)


module.exports = router;
