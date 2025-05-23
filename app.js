import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routers/user.router.js'
import formRouter from './routers/form.router.js';
import grievanceRouter from './routers/grievance.router.js';
import logsRouter from './routers/logs.router.js';
import errorHandler from './middleware/errorMiddleware.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Grievance_Media from './model/grievance_media.model.js';
import upload from './middleware/uploadPic.js';
import { verifyToken } from './middleware/verifytokenMiddleware.js';
import officerRouter from './routers/officer.router.js';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, 
//     max: 5,
//     message: "Too many login attempts. Try again later.",
// });

const app = express();
// app.use(
//     cors({
//         origin: "http://192.168.1.46:3000/api/login",  // Update to your frontend URL
//         credentials: true,  // Allow cookies
//     })
// );
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api', userRouter);
app.use('/api', formRouter);
app.use('/api', grievanceRouter);
app.use('/api', logsRouter);
app.use('/api', officerRouter);


app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(errorHandler);


app.listen(3000, () => {console.log('listening on port 3000');});