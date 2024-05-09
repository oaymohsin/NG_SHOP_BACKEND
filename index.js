const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv/config");

const categoryRoute = require("./routes/categoryRoute");
const productsRoute = require("./routes/productsRoute");
const userRoute = require("./routes/userRoute");
const orderRoute=require("./routes/orderRoute")

const authJwt=require('./middlewares/jwt')

app.use(cors());
app.options("*", cors());

// app.use('/',(req,res)=>{
//   res.send("hello from server")
// })



//middlewares
app.use("/public/uploads",express.static(__dirname+"/public/uploads"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(authJwt())
// mongoose.connect(3500,()=>{
//     console.log("connected to port")
// })

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("database connection is ready...");
  })
  .catch((error) => {
    console.log(error);
  });

const api = process.env.API_URL;
app.use(`${api}/categories`, categoryRoute);
app.use(`${api}/products`, productsRoute);
app.use(`${api}/users`, userRoute);
app.use(`${api}/orders`,orderRoute)
//to protect Api no one can access api without JWT token



app.listen(process.env.PORT || 3500, () => {
  console.log(`app is listening on port ${process.env.PORT}`);
});
