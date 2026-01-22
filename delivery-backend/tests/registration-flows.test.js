/**
 * Registration Flows and Admin Functionality Test Suite
 * Tests all user roles, authentication, and admin capabilities
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const TEST_DATA = {
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@test.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'customer'
  },
  deliveryPerson: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'driver@test.com',
    password: 'password123',
    phone: '+1234567891',
    role: 'delivery_person',
    deliveryPersonProfile: {
      vehicleType: 'motorcycle',
      licenseNumber: 'DL123456',
      licenseExpiry: '2025-12-31',
      workingAreas: [{ city: 'New York', radius: 10 }],
      emergencyContact: { name: 'Emergency Contact', phone: '+1234567899' }
    }
  },
  businessOwner: {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'business@test.com',
    password: 'password123',
    phone: '+1234567892',
    role: 'business_owner',
    businessProfile: {
      businessType: 'restaurant'
    }
  },
  admin: {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: 'password123',
    phone: '+1234567893',
    role: 'admin'
  }
};

let testTokens = {};
let testUsers = {};

class RegistrationTestSuite {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      this.passed++;
      this.tests.push({ name: testName, status: 'PASS' });
      console.log(`✅ PASS: ${testName}`);
    } catch (error) {
      this.failed++;
      this.tests.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
    }
  }

  // Test 1: Health Check
  async testHealthCheck() {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    if (!response.data.success) {
      throw new Error('Health check failed');
    }
  }

  // Test 2: Customer Registration
  async testCustomerRegistration() {
    const response = await axios.post(`${API_BASE}/auth/register`, TEST_DATA.customer);
    if (!response.data.success) {
      throw new Error(`Customer registration failed: ${response.data.message}`);
    }
    testUsers.customer = response.data.data.user;
    testTokens.customer = response.data.data.token;
  }

  // Test 3: Delivery Person Registration
  async testDeliveryPersonRegistration() {
    const response = await axios.post(`${API_BASE}/auth/register`, TEST_DATA.deliveryPerson);
    if (!response.data.success) {
      throw new Error(`Delivery person registration failed: ${response.data.message}`);
    }
    testUsers.deliveryPerson = response.data.data.user;
    testTokens.deliveryPerson = response.data.data.token;
  }

  // Test 4: Business Owner Registration
  async testBusinessOwnerRegistration() {
    const response = await axios.post(`${API_BASE}/auth/register`, TEST_DATA.businessOwner);
    if (!response.data.success) {
      throw new Error(`Business owner registration failed: ${response.data.message}`);
    }
    testUsers.businessOwner = response.data.data.user;
    testTokens.businessOwner = response.data.data.token;
  }

  // Test 5: Login Functionality
  async testLogin() {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_DATA.customer.email,
      password: TEST_DATA.customer.password
    });
    if (!response.data.success) {
      throw new Error(`Login failed: ${response.data.message}`);
    }
  }

  // Test 6: Protected Route Access
  async testProtectedRouteAccess() {
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${testTokens.customer}` }
    });
    if (!response.data.success) {
      throw new Error('Protected route access failed');
    }
  }

  // Test 7: Role-Based Access Control
  async testRoleBasedAccess() {
    try {
      // Customer should NOT access admin routes
      await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${testTokens.customer}` }
      });
      throw new Error('Customer should not access admin routes');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Unexpected error: ${error.message}`);
      }
      // 403 is expected - test passes
    }
  }

  // Test 8: Forgot Password Flow
  async testForgotPassword() {
    const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
      email: TEST_DATA.customer.email
    });
    if (!response.data.success) {
      throw new Error(`Forgot password failed: ${response.data.message}`);
    }
  }

  // Test 9: User Profile Update
  async testProfileUpdate() {
    const response = await axios.put(`${API_BASE}/users/profile`, {
      firstName: 'UpdatedJohn'
    }, {
      headers: { Authorization: `Bearer ${testTokens.customer}` }
    });
    if (!response.data.success) {
      throw new Error(`Profile update failed: ${response.data.message}`);
    }
  }

  // Test 10: Duplicate Registration Prevention
  async testDuplicateRegistration() {
    try {
      await axios.post(`${API_BASE}/auth/register`, TEST_DATA.customer);
      throw new Error('Duplicate registration should be prevented');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error(`Unexpected error: ${error.message}`);
      }
      // 400 is expected - test passes
    }
  }

  // Test 11: OAuth Endpoints (should return not configured)
  async testOAuthEndpoints() {
    try {
      const response = await axios.get(`${API_BASE}/auth/oauth/google`);
      if (response.data.error !== 'OAUTH_NOT_CONFIGURED') {
        throw new Error('OAuth should return not configured error');
      }
    } catch (error) {
      if (error.response?.status === 501 && error.response?.data?.error === 'OAUTH_NOT_CONFIGURED') {
        // Expected behavior - test passes
        return;
      }
      throw new Error(`Unexpected OAuth response: ${error.message}`);
    }
  }

  // Test 12: Validation Endpoints
  async testValidationEndpoints() {
    const response = await axios.get(`${API_BASE}/validation/requirements/customer`);
    if (!response.data.success) {
      throw new Error('Validation requirements endpoint failed');
    }
  }

  // Test 13: Business Creation (for business owners)
  async testBusinessCreation() {
    const businessData = {
      name: 'Test Restaurant',
      businessType: 'restaurant',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      contact: {
        phone: '+1234567890',
        email: 'restaurant@test.com'
      }
    };

    const response = await axios.post(`${API_BASE}/businesses`, businessData, {
      headers: { Authorization: `Bearer ${testTokens.businessOwner}` }
    });
    if (!response.data.success) {
      throw new Error(`Business creation failed: ${response.data.message}`);
    }
  }

  // Main test runner
  async runAllTests() {
    console.log('\n🚀 Starting Registration Flows Test Suite\n');
    console.log('=' * 50);

    await this.runTest('Health Check', () => this.testHealthCheck());
    await this.runTest('Customer Registration', () => this.testCustomerRegistration());
    await this.runTest('Delivery Person Registration', () => this.testDeliveryPersonRegistration());
    await this.runTest('Business Owner Registration', () => this.testBusinessOwnerRegistration());
    await this.runTest('Login Functionality', () => this.testLogin());
    await this.runTest('Protected Route Access', () => this.testProtectedRouteAccess());
    await this.runTest('Role-Based Access Control', () => this.testRoleBasedAccess());
    await this.runTest('Forgot Password Flow', () => this.testForgotPassword());
    await this.runTest('Profile Update', () => this.testProfileUpdate());
    await this.runTest('Duplicate Registration Prevention', () => this.testDuplicateRegistration());
    await this.runTest('OAuth Endpoints Configuration', () => this.testOAuthEndpoints());
    await this.runTest('Validation Endpoints', () => this.testValidationEndpoints());
    await this.runTest('Business Creation', () => this.testBusinessCreation());

    this.printResults();
  }

  printResults() {
    console.log('\n' + '=' * 50);
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' * 50);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.tests.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   └─ Error: ${test.error}`);
      }
    });

    console.log('\n🔍 Test Coverage:');
    console.log('✅ User Registration (All Roles)');
    console.log('✅ Authentication & Authorization');
    console.log('✅ Role-Based Access Control');
    console.log('✅ Password Reset Flow');
    console.log('✅ Profile Management');
    console.log('✅ Data Validation');
    console.log('✅ Security Measures');
    console.log('✅ OAuth Configuration');
    console.log('✅ Business Management');
    
    if (this.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Registration system is working correctly.');
    } else {
      console.log(`\n⚠️  ${this.failed} test(s) failed. Please review and fix issues.`);
    }
  }
}

// Export for module usage
export default RegistrationTestSuite;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new RegistrationTestSuite();
  testSuite.runAllTests()
    .then(() => {
      process.exit(testSuite.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite crashed:', error);
      process.exit(1);
    });
}