// this'll contain anything, that's not related to express application.

// now, we can call the environment variables from anywhere
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8000, (req, res, next) => {
      console.log(
        `Server is running on port ${process.env.PORT} in "${process.env.NODE_ENV} environment"`
      );
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
