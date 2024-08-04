import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({});

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";

const app = express();

//middlewares  //required in all node backend projects
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

const port = process.env.PORT || 3000;

//APIs
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);

app.listen(port, () => {
  connectDB();
  console.log(`Srver running on port ${port}`);
});
