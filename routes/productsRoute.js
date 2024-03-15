const express = require("express");
const router = express.Router();
const productsController=require('../controllers/productsController');


    router.post('/createProduct',productsController.uploadMiddleware,productsController.createNewProduct)
    router.get('/getProductsList',productsController.getProductsList)
    router.get('/getProductById/:id',productsController.getProductById)
    router.put('/updateProductById/:id',productsController.uploadMiddleware,productsController.updateProductById)
    router.delete('/deleteProductById/:id',productsController.deleteProductById)
    router.get('/countProducts',productsController.countProducts)
    router.get('/getFeaturedProducts/:count',productsController.getFeaturedProducts)
    router.put('/uploadGalleryImages/:id',productsController.uploadMulitipleImagesMiddleware,productsController.uploadGalleryImages)


module.exports=router