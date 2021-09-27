// this'll contain anything, that's not related to express application.

// now, we can call the environment variables from anywhere
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const server = app.listen(process.env.PORT || 8000, () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log(`Server is running on port: ${process.env.PORT} (${process.env.NODE_ENV} environment)`);
    });
});

// let's handle our unhandeled promise rejetion (globally) by using event listeners
// But, we dont' rely on them, we have to add our catch blocks whenever we need.
process.on('unhandledRejection', err => {
  // Now ,we are handeling all the rejection resulted from our promises
  console.error(err.name, err.message);
  console.log('Unhandled rejections, shutting down....');
  server.close(() => process.exit(1));
});

// Let's handle our uncaught exceptions
process.on('uncaughtException', err => {
  // Now ,we are handeling all the rejection resulted from our promises
  console.error(err.name, err.message);
  console.log('Uncaught exceptions, shutting down....');
  server.close(() => process.exit(1));
});

// on production (heroku) the dyno restarts every 24 hours to keep our server healty and active
// so what if we have some requests during this time? they will be hanging, and of course we don't
// want to have that
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});