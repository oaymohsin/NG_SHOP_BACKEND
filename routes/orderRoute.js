const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/createOrder", orderController.createOrder);
router.get("/getOrderList", orderController.getOrderList);
router.get("/getOrderById/:id", orderController.getOrderById);
router.put("/updateOrderById/:id", orderController.updateOrderById);
router.delete("/deleteOrderById/:id", orderController.deleteOrderById);
router.get("/countOrders", orderController.countOrders);
router.get("/getOrderByUserId/:userId", orderController.getOrderByUserId);
router.get("/getTotalSales", orderController.getTotalSales);

router.post("/create-checkout-session", orderController.createCheckoutSession);

module.exports = router;
