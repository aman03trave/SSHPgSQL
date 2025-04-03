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

app.post('/api/grievances', upload.fields([{ name: 'image' }, { name: 'document' }]), async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const grievance = new Grievance_Media({ ...req.body, userId: decoded.userId, image: req.files?.image?.[0]?.path, document: req.files?.document?.[0]?.path });
      await grievance.save();
      res.status(201).json({ message: "Grievance submitted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Submission failed" });
    }
  });


app.use(errorHandler);


app.listen(3000, () => {console.log('listening on port 3000');});