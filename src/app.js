import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// CORS CONFIGURATION
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// CONFIGURATION FOR JSON ACCEPTANCE LIMIT

app.use(express.json({ limit: "16kb" }));

// CONFIGURATION FOR DATA INCOMING FROM URL || URL IS ENCODED WITH SPECIAL CHARACTERS LIKE "SPACE" => "%20" TO HANDLE THAT WE USE

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// TO KEEP STATIC FILES IN A CERTAIN FOLDER WITH IN THE SERVER, IN THIS CASE "public"

app.use(express.static("public"));

// COOKIE CONFIGURATION

app.use(cookieParser);

export { app };
