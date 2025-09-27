import express from 'express';
import tasksRoutes from '../../../routes/tasks.routes.js';

const app = express();

app.use(express.json());
app.use('/api/tasks', tasksRoutes);


export default app;
