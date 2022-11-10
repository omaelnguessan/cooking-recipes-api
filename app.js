const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const { dbUsername, dbPassword, dbName, appPort } = require("./config/app");
const categoryRouter = require("./routes/category");
const { fileFilter, fileStorage } = require("./config/multer");

const app = express();

const port = appPort || process.env.port;
//body-parser
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/images/",
  express.static(path.join(__dirname, "public", "images"))
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//app route

app.use("/category", categoryRouter);

//middleware for error
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// database connection
mongoose
  .connect(
    `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.ahsut7k.mongodb.net/${dbName}?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(port, () => {
      console.log(`App start on port : ${port}`);
    });
  });
