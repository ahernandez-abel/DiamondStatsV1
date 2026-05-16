import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import playersRoutes from './routes/players.routes.js';
import teamsRoutes from './routes/teams.routes.js';
import gamesRoutes from './routes/games.routes.js';
import statsRoutes from './routes/stats.routes.js';
import leadersRoutes from './routes/leaders.routes.js';
import publicRoutes from './routes/public.routes.js';
import tenantsRoutes from './routes/tenants.routes.js';
import adminDashboardRoutes from './routes/adminDashboard.routes.js'
import superadminRoutes from './routes/superadmin.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'DiamondStats API funcionando',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaders', leadersRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/superadmin', superadminRoutes);

app.use(errorMiddleware);

export default app;