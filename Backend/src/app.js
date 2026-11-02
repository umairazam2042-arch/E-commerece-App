const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Stripe webhook ko raw body chahiye (signature check ke liye), is liye json parser se PEHLE
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

const { corsMiddleware } = require('./config/cors');

app.use(corsMiddleware);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;