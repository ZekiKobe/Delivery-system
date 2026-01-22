import sequelize from './sequelize.js';

const connectDB = async () => {
  try {
    console.log('Connecting to SQL database with Sequelize...');
    
    // Connect to SQL database with Sequelize
    await sequelize.authenticate();
    
    // Only sync in development - use migrations in production
    // Note: We don't sync automatically to avoid index conflicts
    // Use migrations to manage schema changes: npm run migrate
    if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
      // Only sync if explicitly enabled via environment variable
      // Use force: false and alter: false for safety
      await sequelize.sync({ alter: false });
    }

    console.log('SQL database connected successfully');

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;