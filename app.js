import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routers/user.router.js'
import formRouter from './routers/form.router.js';

const app = express();
app.use(bodyParser.json());
app.use('/api', userRouter);
app.use('/api', formRouter);


export default app;