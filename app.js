import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routers/user.router.js'
import formRouter from './routers/form.router.js';
import errorHandler from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';

// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, 
//     max: 5,
//     message: "Too many login attempts. Try again later.",
// });

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api', userRouter);
app.use('/api', formRouter);
app.use(errorHandler);


app.listen(3000, () => {console.log('listening on port 3000');});