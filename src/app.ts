import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { errorHandler } from './interfaces/middlewares/errorHandler';
import orcRouter from './interfaces/routes/router'

dotenv.config()

const app = express();


app.use(
  cors({
    origin: process.env.FRONDENDURL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',orcRouter);

app.use(errorHandler)

app.listen(process.env.PORT || 6000,()=>console.log(`server run at port ${process.env.PORT}`));

