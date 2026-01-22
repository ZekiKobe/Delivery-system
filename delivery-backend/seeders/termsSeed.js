import User from '../models/User.js';
import Terms from '../models/Terms.js';
import connectDB from '../config/database.js';

/**
 * Seed terms and conditions
 */
export const seedTerms = async () => {
  try {
    console.log('Seeding terms and conditions...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing terms
    await Terms.destroy({ where: {} });
    
    // Get admin user ID for updatedBy field
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    const updatedById = adminUser ? adminUser.id : 1;
    
    // Create terms documents
    const terms = [
      {
        title: 'User Terms and Conditions',
        content: `
## User Terms and Conditions

Welcome to our delivery service. By using our platform, you agree to these terms and conditions.

### 1. Account Registration
- You must provide accurate and complete information during registration
- You are responsible for maintaining the security of your account
- You must be at least 18 years old to use our services

### 2. Ordering Process
- All orders are subject to availability
- Prices are subject to change without notice
- We reserve the right to cancel orders at any time

### 3. Payment Terms
- Payment is required at the time of order placement
- We accept various payment methods including credit cards and mobile money
- All payments are processed securely

### 4. Delivery Terms
- Delivery times are estimates and may vary
- Delivery fees apply to all orders unless stated otherwise
- We are not responsible for delays caused by traffic or weather conditions

### 5. Cancellation and Refunds
- Orders can be cancelled before preparation begins
- Refunds are processed according to our refund policy
- Contact customer support for cancellation requests

### 6. User Responsibilities
- Provide accurate delivery information
- Ensure someone is available to receive the order
- Report any issues with orders promptly

### 7. Limitation of Liability
- We are not liable for indirect or consequential damages
- Our liability is limited to the value of the order
- We are not responsible for acts of God or force majeure events

### 8. Changes to Terms
- We reserve the right to modify these terms at any time
- Continued use of the service constitutes acceptance of changes
- We will notify users of significant changes

### 9. Governing Law
- These terms are governed by the laws of Ethiopia
- Disputes will be resolved in Ethiopian courts
        `,
        type: 'customer',
        version: '1.0',
        effective_date: new Date(),
        is_active: true,
        updated_by: updatedById
      },
      {
        title: 'Business Terms and Conditions',
        content: `
## Business Terms and Conditions

These terms apply to businesses using our delivery platform.

### 1. Business Registration
- Businesses must provide valid licenses and documentation
- All information must be accurate and up-to-date
- Businesses must comply with local regulations

### 2. Service Agreement
- Businesses agree to provide quality products and services
- Businesses must maintain proper hygiene and safety standards
- Businesses are responsible for product quality and safety

### 3. Commission and Fees
- Standard commission rates apply to all orders
- Payment processing fees may apply
- Promotional costs may be shared between parties

### 4. Order Management
- Businesses must accept orders within specified timeframes
- Businesses are responsible for order preparation
- Businesses must notify of any order issues immediately

### 5. Delivery Coordination
- Businesses must prepare orders for timely pickup
- Businesses must provide accurate preparation times
- Businesses must coordinate with delivery personnel

### 6. Customer Service
- Businesses must handle customer complaints professionally
- Businesses must maintain high service standards
- Businesses must respond to reviews and feedback

### 7. Marketing and Promotion
- Businesses may participate in promotional campaigns
- Businesses must comply with marketing guidelines
- Businesses may provide promotional materials

### 8. Data and Privacy
- Businesses must protect customer data
- Businesses must comply with privacy regulations
- Businesses may access order data for business purposes

### 9. Termination
- Either party may terminate with proper notice
- Violation of terms may result in immediate termination
- Outstanding payments must be settled upon termination

### 10. Dispute Resolution
- Disputes will be resolved through mediation
- Legal action may be pursued if mediation fails
- Ethiopian law governs all disputes
        `,
        type: 'business_owner',
        version: '1.0',
        effective_date: new Date(),
        is_active: true,
        updated_by: updatedById
      },
      {
        title: 'Delivery Personnel Terms',
        content: `
## Delivery Personnel Terms

These terms apply to delivery personnel using our platform.

### 1. Registration Requirements
- Must have valid identification documents
- Must have appropriate vehicle and insurance
- Must pass background checks and training

### 2. Service Standards
- Must maintain professional appearance and behavior
- Must follow traffic laws and safety regulations
- Must handle products with care

### 3. Delivery Process
- Must pickup orders within specified timeframes
- Must deliver orders to correct addresses
- Must collect payments when required

### 4. Communication
- Must maintain communication with dispatch
- Must report issues immediately
- Must provide delivery confirmations

### 5. Compensation
- Paid per successful delivery
- Bonuses for performance and reliability
- Payments processed on regular schedules

### 6. Equipment and Maintenance
- Responsible for vehicle maintenance
- Must have necessary delivery equipment
- Must report equipment issues promptly

### 7. Insurance and Liability
- Must maintain required insurance coverage
- Not liable for product quality issues
- Responsible for damages caused by negligence

### 8. Performance Standards
- Must maintain delivery time standards
- Must achieve customer satisfaction targets
- Subject to performance reviews and feedback

### 9. Code of Conduct
- Must treat customers with respect
- Must not discriminate against anyone
- Must report any unethical behavior

### 10. Termination
- Subject to performance and conduct reviews
- May be terminated for policy violations
- Must return company property upon termination
        `,
        type: 'delivery_person',
        version: '1.0',
        effective_date: new Date(),
        is_active: true,
        updated_by: updatedById
      }
    ];
    
    for (const term of terms) {
      await Terms.create(term);
    }
    
    console.log('Terms and conditions seeded successfully!');
  } catch (error) {
    console.error('Terms seeding failed:', error);
  }
};

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTerms().then(() => {
    console.log('Terms seeding process finished');
    process.exit(0);
  }).catch(error => {
    console.error('Terms seeding process failed:', error);
    process.exit(1);
  });
}