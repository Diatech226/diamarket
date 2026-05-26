import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './routes';

export const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', apiRouter);
