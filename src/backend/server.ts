import express from 'express';
import cors from 'cors';
import { contextHandler } from './contextHandler';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());

app.get('/api/context', contextHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
