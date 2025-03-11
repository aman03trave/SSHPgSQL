import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routers/user.router.js'

const app = express();
app.use(bodyParser.json());
app.use('/api', userRouter);


export default app;