import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import genRoute from './routes/genRoute.route.js';
import cors from 'cors';
dotenv.config();
const app = express();
const PORT= process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/generateIcon', genRoute);
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})