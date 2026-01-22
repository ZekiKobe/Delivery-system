import dotenv from 'dotenv';
import User from './models/User.js';
import { hashPassword } from './utils/password.js';
import connectDB from './config/database.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    console.log('Connecting to MySQL database...');
    await connectDB();
    console.log('Connected to MySQL database successfully!');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log(`\n✅ Admin user already exists:`);
      console.log(`  Name: ${existingAdmin.first_name} ${existingAdmin.last_name}`);
      console.log(`  Email: ${existingAdmin.email}`);
      return;
    }

    // Create admin user
    console.log('\nCreating admin user...');
    const adminUser = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@fastdrop.com',
      password: await hashPassword('admin123'),
      phone: '+251911000000',
      role: 'admin',
      is_email_verified: true,
      is_phone_verified: true,
      is_active: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`  Name: ${adminUser.first_name} ${adminUser.last_name}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: admin123 (please change after first login)`);
    console.log(`  Role: ${adminUser.role}`);

    console.log('\n🚀 To access the admin dashboard:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend server: cd ../Delivery-frontend && npm run dev');
    console.log('   3. Open your browser and go to: http://localhost:5173');
    console.log('   4. Log in with the admin credentials above');
    console.log('   5. Navigate to the Admin Dashboard');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();