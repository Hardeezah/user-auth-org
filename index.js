const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const authenticateJWT = require('./middleware/auth');

require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', organisationRoutes); 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
