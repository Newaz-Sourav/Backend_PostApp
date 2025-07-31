// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`mongodb+srv://nsourov07:sourav1998@clusterfirst.bb6tecs.mongodb.net/miniProject`, {
      useNewUrlParser: true,
      useUnifiedTopology: true, 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
