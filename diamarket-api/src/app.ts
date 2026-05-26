import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';

export const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', apiRouter);
app.use(errorHandler);
