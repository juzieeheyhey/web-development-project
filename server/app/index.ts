import express from 'express';
import cors from 'cors';
import userRouter from './user/user.router.ts';
import helloRouter from './hello/hello.router.ts';
import eventsRouter from './event/event.router.ts';
import tagsRouter from './tags/tags.router.ts';
import authRouter from './auth/auth.router.ts';

const app = express();
// const PORT = 5001;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(express.json());
app.use('/api', authRouter);
app.use('/api', helloRouter);
app.use('/api/user', userRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tags', tagsRouter);

export default app;
