const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Complaint Management API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled promise rejection:', err.message);
    server.close(() => process.exit(1));
  });
});
