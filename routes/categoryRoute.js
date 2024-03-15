const express = require("express");
const router = express.Router();
const categoryController=require('../controllers/categoryController')

router.post('/createCategory',categoryController.createCategory)
router.delete('/deleteCategoryById/:id',categoryController.deleteCategoryById)
router.get('/getAllCategoryList',categoryController.getCategoryList)
router.get('/getCategoryById/:id',categoryController.getCategoryById)
router.put('/updateCategoryById/:id',categoryController.updateCategoryById)

module.exports=router
