require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoute = require("./Routes/AuthRoutes");

const { OrdersModel } = require("./model/OrdersModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");

const PORT = process.env.PORT || 3002;
const url = process.env.MONGO_URL;

const app = express();

/* ===== Middleware (ORDER MATTERS) ===== */

app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.json());

const allowedOrigins = [
  "https://zerodha-frontend-taupe-gamma.vercel.app",
  "https://zerodha-dashboard-8q93e0xd3-pra90mathurs-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// Explicit preflight handling
// app.options("*", cors());

/* ===== Routes ===== */

app.use("/", authRoute);

/* ===== DB Connection ===== */

async function main() {
  await mongoose.connect(url);
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

/* ===== API Routes ===== */

// app.get("/insertPositions", async (req, res) => {
//   let temp = [ ... ];
// });

app.get("/holdings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/positions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });

  await newOrder.save();

  res.send("Order Saved");
});

/* ===== Server ===== */

app.listen(PORT, () => {
  console.log(`App is listening to the port : ${PORT}`);
});
