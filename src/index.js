// require("dotenv").config({ path: "./env" });
import connectDB from "./db/dbconnect.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("ERROR", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection error");
  });

// DB CONNECTION IN THE INDEX.JS FILE WITHOUR USING FILE STRUCTURE METHOD

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

// import express from "express";

// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERROR:", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR:", error);
//     throw err;
//   }
// })();
