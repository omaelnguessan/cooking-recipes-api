const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const { dbUsername, dbPassword, dbName, appPort } = require("./config/app");
const { fileFilter, fileStorage } = require("./config/multer");

const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/category");
const recipeRouter = require("./routes/recipe");

const { corsMiddleware } = require("./middleware/cors");
const { errorMiddleware } = require("./middleware/error");

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

app.use(corsMiddleware);

//app route
app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/recipes", recipeRouter);

//middleware for error
app.use(errorMiddleware);

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
