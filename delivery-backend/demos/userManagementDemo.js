// User Management System Demo
// This script demonstrates the enhanced user management features

import User from '../models/User.js';
import userService from '../services/userService.js';
import { generateToken } from '../utils/jwt.js';

console.log('=== User Management System Demo ===\n');

async function runDemo() {
  try {
    // 1. Create a test user
    console.log('1. Creating a test user...');
    const user = await User.create({
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@example.com',
      password: 'Demo123!',
      phone: '+1234567890',
      role: 'customer',
      date_of_birth: '1990-01-01',
      gender: 'prefer_not_to_say'
    });
    console.log('✓ User created successfully\n');

    // 2. Generate authentication token
    console.log('2. Generating authentication token...');
    const token = generateToken({ userId: user.id, role: user.role });
    console.log('✓ Token generated\n');

    // 3. Update user profile
    console.log('3. Updating user profile...');
    await userService.updateUser(user.id, {
      first_name: 'Updated Demo',
      last_name: 'User'
    });
    console.log('✓ Profile updated\n');

    // 4. Add user addresses
    console.log('4. Adding user addresses...');
    const addresses = [
      {
        id: '1',
        label: 'Home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        isDefault: true
      },
      {
        id: '2',
        label: 'Work',
        street: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        isDefault: false
      }
    ];
    await userService.updateUserAddresses(user.id, addresses);
    console.log('✓ Addresses added\n');

    // 5. Update user preferences
    console.log('5. Updating user preferences...');
    await userService.updateUserPreferences(user.id, {
      dietary: ['vegetarian', 'gluten-free'],
      cuisine: ['italian', 'mexican'],
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    });
    console.log('✓ Preferences updated\n');

    // 6. Get user statistics
    console.log('6. Getting user statistics...');
    const stats = await userService.getUserStatistics();
    console.log('✓ User statistics retrieved:');
    console.log(`   Total users: ${stats.total}`);
    console.log(`   Active users: ${stats.active}`);
    console.log(`   Verified users: ${stats.verified}`);
    console.log(`   Users by role:`, stats.byRole);
    console.log('');

    // 7. Search users
    console.log('7. Searching users...');
    const searchResults = await userService.searchUsers('demo');
    console.log('✓ Search completed:');
    console.log(`   Found ${searchResults.count} users\n`);

    // 8. Get user activity summary
    console.log('8. Getting user activity summary...');
    const activity = await userService.getUserActivitySummary(user.id, 30);
    console.log('✓ Activity summary retrieved:');
    console.log(`   Last login: ${activity.lastLogin}`);
    console.log(`   Last activity: ${activity.lastActivity}`);
    console.log(`   Account created: ${activity.accountCreated}`);
    console.log(`   Is active: ${activity.isActive}\n`);

    // 9. Generate referral code
    console.log('9. Generating referral code...');
    const referralCode = userService.generateReferralCode();
    console.log(`✓ Referral code generated: ${referralCode}\n`);

    // 10. Clean up - delete test user
    console.log('10. Cleaning up test user...');
    await User.destroy({ where: { email: 'demo@example.com' } });
    console.log('✓ Test user deleted\n');

    console.log('=== Demo completed successfully ===');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo
runDemo();