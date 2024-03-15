const { Order } = require("../models/order");
const { orderItem } = require("../models/orderItemModel");
const { Product } = require("../models/productModel");
const stripe = require("stripe")(
  "sk_test_51OtRDuSBR6ewkHIDO9PcV7cx1hTlfroWeUswZnAvHyn32iziJJAjdLNAmAF76lxIxLJkQFAUsQKwdOYCN1r9KR0c009tAnBifg"
);

exports.createOrder = async (req, res, next) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (OrderItem) => {
      let newOrderItem = new orderItem({
        quantity: OrderItem.quantity,
        product: OrderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const OrderItem = await orderItem
        .findById(orderItemId)
        .populate("product", "price");
      const totalPrice = OrderItem.product.price * OrderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  console.log(totalPrices);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) {
    return res.status(400).json({
      message: "Error Occured",
      data: false,
    });
  } else {
    return res.status(200).json({
      message: "new product added successfully",
      data: true,
      result: order,
    });
  }
};

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const orderItems = req.body;
    console.log(orderItems);
    if (!orderItems) {
      return res.status(400).json({
        message: "checkout Session cannot be created - check the order Items",
      });
    }
    const lineItems = [];

    await Promise.all(
      orderItems.map(async (orderItem) => {
        const product = await Product.findById(orderItem.product);
        //agar product ni milta
        if (!product) {
          res.status(400).json({
            message: "product not found against given product Id",
            result: null,
            data: false,
          });
        }
        //aur agar product mil jy
        else {
          imagesArray = [];
          product.images.map((imageUrl) => {
            const encodedImageUrl = encodeURIComponent(imageUrl);
            imagesArray.push(encodedImageUrl);
          });
          console.log(imagesArray)
          //agar product object mein stripeProductId nahi hai to
          if (!product.stripeProductId) {
            const stripeProduct = await stripe.products.create({
              name: product.name,
              description: product.description,
              images: imagesArray,
            });
            //create price for recently created product
            const stripePrice = await stripe.prices.create({
              unit_amount: product.price * 100,
              currency: "usd",
              product: stripeProduct.id,
            });
            //ab stripe product id or stripe price id ko db mn store kro
            product.stripeProductId = stripeProduct.id;
            product.stripePriceId = stripePrice.id;
            await product.save();

            lineItems.push({
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price: stripePrice.id,
              quantity: orderItem.quantity,
            });
          }
          //agar product object mn stripeProductId hai to
          else {
            if (product.stripeProductId) {
              //stripe product id hai lekin stripe price id ni hai to
              if (!product.stripePriceId) {
                //create price against the present stripe product id
                const stripePrice = await stripe.prices.create({
                  unit_amount: product.price * 100,
                  currency: "usd",
                  product: product.stripeProductId,
                });
                //db mn save kr do
                product.stripePriceId = stripePrice.id;
                await product.save();
                lineItems.push({
                  // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                  price: stripePrice.id,
                  quantity: orderItem.quantity,
                });
              } else {
                lineItems.push({
                  // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                  price: product.stripePriceId,
                  quantity: orderItem.quantity,
                });
              }
            }
          }
        }
      })
    );

    // console.log(lineItems);
    // const lineItems = await Promise.all(
    //   orderItems.map(async (orderItem) => {
    //     const product = await Product.findById(orderItem.product);
    //     // return {
    //     //   price_data: {
    //     //     currency: "usd",
    //     //     product_data: {
    //     //       name: "product.name",
    //     //     },
    //     //     unit_amount: product.price * 100,
    //     //   },
    //     //   quantity: orderItem.quantity,
    //     // };
    //     return {
    //       // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
    //       price: product.price.toString(),
    //       quantity: 1,
    //     };
    //   })
    // );
    console.log(lineItems);

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:4200/success",
      cancel_url: "http://localhost:4200/error",
    });

    res.json({ id: session.id });
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
};

exports.getOrderList = async (req, res, next) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .sort({ dataOrdered: -1 });

    if (!orderList) {
      return res.status(400).json({
        message: "not found",
        data: false,
      });
    }
    return res.status(200).json({
      message: "product list fetched successfully",
      data: true,
      result: orderList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Occured",
      error: error.message,
      data: false,
    });
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });

    if (!order) {
      return res.status(400).json({
        message: "not found",
        data: false,
      });
    }
    return res.status(200).json({
      message: "product list fetched successfully",
      data: true,
      result: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Occured",
      error: error.message,
      data: false,
    });
  }
};

exports.updateOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const order = await Order.findByIdAndUpdate(
      id,
      { status: req.body.status },
      {
        new: true,
      }
    );
    if (!order) {
      res.status(400).json({
        message: "order not updated",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfully updated",
      data: true,
      result: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal Server error",
      error: error.message,
      data: false,
    });
  }
};

exports.deleteOrderById = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const id = req.params.id;
    await Order.findByIdAndDelete(id).then(async (order) => {
      if (!order) {
        return res.status(400).json({
          message: "errror Occured",
          data: false,
        });
      } else {
        await order.orderItems.map(async (orderItems) => {
          await orderItem.findByIdAndDelete(orderItems._id);
        });
        return res.status(200).json({
          message: "deleted successfully",
          data: true,
        });
      }
    });
    // console.log(order)
  } catch (error) {
    res.status(400).json({
      message: "errror Occured",
      data: false,
    });
  }
};

exports.countOrders = async (req, res, next) => {
  try {
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
      return res.status(400).json({
        message: "Error in counting ",
        data: false,
      });
    }
    return res.status(200).json({
      message: "Order Counted Successfully",
      data: true,
      result: orderCount,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Internal Server error ",
      data: false,
    });
  }
};

exports.getOrderByUserId = async (req, res, next) => {
  const userOrderList = await Order.find({ user: req.params.userId })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dataOrdered: -1 });

  if (!userOrderList) {
    return res.status(400).json({
      message: "Error in counting ",
      data: false,
    });
  }
  return res.status(200).json({
    message: "Orders fetched Successfully",
    data: true,
    result: userOrderList,
  });
};

exports.getTotalSales = async (req, res, next) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    if (!totalSales) {
      return res.status(400).json({
        message: "an error Occured",
        data: false,
      });
    } else {
      return res.status(500).json({
        message: "total Sales calculated successfully",
        result: totalSales.pop().totalsales,
        data: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "an error Occured",
      data: false,
    });
  }
};
