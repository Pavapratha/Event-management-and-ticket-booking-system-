require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'lycaonstaff123@gmail.com' });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating role to admin...');
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save({ validateBeforeSave: false });
      console.log('Admin role updated successfully!');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('ABCabc123#@', salt);

      // Create admin user directly (bypass pre-save hook by using create)
      const admin = new User({
        name: 'Admin',
        email: 'lycaonstaff123@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });

      // Save without triggering password re-hash (password already hashed)
      await User.collection.insertOne({
        name: 'Admin',
        email: 'lycaonstaff123@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Admin user created successfully!');
      console.log('   Email: lycaonstaff123@gmail.com');
      console.log('   Password: ABCabc123#@');
      console.log('   Role: admin');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
