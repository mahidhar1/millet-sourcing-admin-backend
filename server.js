const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// app files
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const contactusRoute = require("./routes/contactusRoute");
const errorHandler = require("./middlewares/errorMiddleware");
const { application } = require("express");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://partner-with-us-millet-sourcing.vercel.app",
    ],
    credentials: true,
  }),
);

// static file upload from a folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactusRoute);

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

//Error middleware
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

// Connect to DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on PORT ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
