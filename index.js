require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const organisationRoutes = require('./routes/organisation');
const { sequelize } = require('./models');

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api', organisationRoutes);

const PORT = process.env.PORT || 4000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log('Error: ' + err));

module.exports = app;
