import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Order from '../models/Order.js';
import { MenuItem, MenuCategory } from '../models/Menu.js';
import { hashPassword } from '../utils/password.js';

/**
 * Seed the database with initial data
 */
export const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await Order.destroy({ where: {} });
    await MenuItem.destroy({ where: {} });
    await MenuCategory.destroy({ where: {} });
    await Business.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    // Create admin user
    const adminUser = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      phone: '+1234567890',
      role: 'admin',
      is_active: true,
      is_email_verified: true
    });
    
    console.log('Created admin user:', adminUser.email);
    
    // Create business owner
    const businessOwner = await User.create({
      first_name: 'Business',
      last_name: 'Owner',
      email: 'owner@example.com',
      password: await hashPassword('owner123'),
      phone: '+1234567891',
      role: 'business_owner',
      is_active: true,
      is_email_verified: true
    });
    
    console.log('Created business owner:', businessOwner.email);
    
    // Create delivery person
    const deliveryPerson = await User.create({
      first_name: 'Delivery',
      last_name: 'Person',
      email: 'delivery@example.com',
      password: await hashPassword('delivery123'),
      phone: '+1234567892',
      role: 'delivery_person',
      is_active: true,
      is_email_verified: true,
      delivery_person_profile: {
        vehicleType: 'bike',
        isAvailable: true,
        rating: 5.0,
        totalDeliveries: 0
      }
    });
    
    console.log('Created delivery person:', deliveryPerson.email);
    
    // Create customer
    const customer = await User.create({
      first_name: 'John',
      last_name: 'Customer',
      email: 'customer@example.com',
      password: await hashPassword('customer123'),
      phone: '+1234567893',
      role: 'customer',
      is_active: true,
      is_email_verified: true,
      addresses: [
        {
          id: '1',
          label: 'Home',
          street: '123 Main St',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0319, lng: 38.7417 },
          isDefault: true
        }
      ]
    });
    
    console.log('Created customer:', customer.email);
    
    // Create multiple businesses with menus
    const businesses = [
      {
        name: 'Traditional Ethiopian Kitchen',
        description: 'Authentic Ethiopian cuisine with traditional flavors and spices. Experience the rich taste of Ethiopia.',
        business_type: 'restaurant',
        category: ['food', 'restaurant', 'ethiopian'],
        tags: ['ethiopian', 'traditional', 'spicy', 'vegetarian-friendly'],
        address: {
          street: '456 Bole Road',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0319, lng: 38.7417 }
        },
        contact: {
          phone: '+251911234567',
          email: 'ethiopian@example.com',
          website: 'www.ethiopiankitchen.com'
        },
        menuItems: [
          {
            name: 'Doro Wot',
            description: 'Traditional chicken stew with berbere spice, boiled eggs, and injera. A signature Ethiopian dish.',
            price: 180,
            category: 'Main Dishes',
            preparation_time: 45,
            is_available: true,
            is_popular: true,
            is_signature: true,
            is_spicy: true,
            spice_level: 4,
            ingredients: ['chicken', 'berbere', 'onions', 'garlic', 'ginger', 'eggs', 'butter'],
            allergens: ['eggs', 'dairy'],
            dietary: ['halal'],
            tags: ['spicy', 'traditional', 'signature'],
            rating: { average: 4.8, count: 125 }
          },
          {
            name: 'Vegetarian Combo',
            description: 'A delicious mix of lentils, vegetables, and traditional sides served on injera. Perfect for vegetarians.',
            price: 120,
            category: 'Vegetarian',
            preparation_time: 30,
            is_available: true,
            is_popular: true,
            ingredients: ['lentils', 'chickpeas', 'cabbage', 'potatoes', 'carrots', 'injera'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal'],
            tags: ['vegetarian', 'healthy'],
            rating: { average: 4.6, count: 98 }
          },
          {
            name: 'Kitfo',
            description: 'Minced raw beef marinated in mitmita and niter kibbeh. Served with cottage cheese and greens.',
            price: 200,
            category: 'Main Dishes',
            preparation_time: 20,
            is_available: true,
            is_signature: true,
            is_spicy: true,
            spice_level: 5,
            ingredients: ['beef', 'mitmita', 'niter kibbeh', 'cottage cheese', 'greens'],
            allergens: ['dairy'],
            dietary: ['halal'],
            tags: ['raw', 'spicy', 'traditional'],
            rating: { average: 4.7, count: 87 }
          },
          {
            name: 'Shiro Wot',
            description: 'Chickpea stew with berbere spice, served with injera. A classic Ethiopian comfort food.',
            price: 100,
            category: 'Main Dishes',
            preparation_time: 35,
            is_available: true,
            is_popular: true,
            ingredients: ['chickpeas', 'berbere', 'onions', 'garlic', 'oil'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal'],
            tags: ['vegetarian', 'comfort-food'],
            rating: { average: 4.5, count: 112 }
          },
          {
            name: 'Tibs',
            description: 'Sautéed beef or lamb with onions, peppers, and rosemary. Served with injera or bread.',
            price: 220,
            category: 'Main Dishes',
            preparation_time: 25,
            is_available: true,
            is_popular: true,
            ingredients: ['beef', 'onions', 'peppers', 'rosemary', 'butter'],
            allergens: ['dairy'],
            dietary: ['halal'],
            tags: ['grilled', 'popular'],
            rating: { average: 4.6, count: 145 }
          },
          {
            name: 'Firfir',
            description: 'Shredded injera mixed with berbere sauce and spices. A hearty breakfast dish.',
            price: 90,
            category: 'Breakfast',
            preparation_time: 20,
            is_available: true,
            is_spicy: true,
            spice_level: 3,
            ingredients: ['injera', 'berbere', 'onions', 'butter'],
            allergens: ['dairy'],
            dietary: ['vegetarian', 'halal'],
            tags: ['breakfast', 'traditional'],
            rating: { average: 4.4, count: 76 }
          }
        ]
      },
      {
        name: 'Pizza Palace',
        description: 'Authentic Italian pizzas with fresh ingredients. Wood-fired oven for that perfect crust.',
        business_type: 'restaurant',
        category: ['food', 'restaurant', 'italian', 'pizza'],
        tags: ['italian', 'pizza', 'fast-food'],
        address: {
          street: '789 Meskel Square',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0250, lng: 38.7469 }
        },
        contact: {
          phone: '+251922345678',
          email: 'pizza@example.com',
          website: 'www.pizzapalace.com'
        },
        menuItems: [
          {
            name: 'Margherita Pizza',
            description: 'Classic Italian pizza with fresh mozzarella, tomato sauce, and basil. Simple and delicious.',
            price: 220,
            category: 'Pizza',
            preparation_time: 20,
            is_available: true,
            is_popular: true,
            ingredients: ['mozzarella', 'tomato sauce', 'basil', 'olive oil'],
            allergens: ['dairy', 'wheat'],
            dietary: ['vegetarian'],
            tags: ['classic', 'vegetarian'],
            rating: { average: 4.6, count: 203 }
          },
          {
            name: 'Pepperoni Pizza',
            description: 'Classic pepperoni pizza with mozzarella cheese and tomato sauce.',
            price: 280,
            category: 'Pizza',
            preparation_time: 20,
            is_available: true,
            is_popular: true,
            ingredients: ['pepperoni', 'mozzarella', 'tomato sauce'],
            allergens: ['dairy', 'wheat'],
            dietary: [],
            tags: ['meat', 'popular'],
            rating: { average: 4.7, count: 189 }
          },
          {
            name: 'Hawaiian Pizza',
            description: 'Pizza with ham, pineapple, and mozzarella cheese. Sweet and savory combination.',
            price: 260,
            category: 'Pizza',
            preparation_time: 20,
            is_available: true,
            ingredients: ['ham', 'pineapple', 'mozzarella', 'tomato sauce'],
            allergens: ['dairy', 'wheat'],
            dietary: [],
            tags: ['sweet', 'tropical'],
            rating: { average: 4.3, count: 134 }
          },
          {
            name: 'Vegetarian Supreme',
            description: 'Loaded with bell peppers, mushrooms, onions, olives, and mozzarella cheese.',
            price: 250,
            category: 'Pizza',
            preparation_time: 25,
            is_available: true,
            is_popular: true,
            ingredients: ['bell peppers', 'mushrooms', 'onions', 'olives', 'mozzarella'],
            allergens: ['dairy', 'wheat'],
            dietary: ['vegetarian'],
            tags: ['vegetarian', 'loaded'],
            rating: { average: 4.5, count: 156 }
          },
          {
            name: 'BBQ Chicken Pizza',
            description: 'Grilled chicken with BBQ sauce, red onions, and mozzarella cheese.',
            price: 290,
            category: 'Pizza',
            preparation_time: 25,
            is_available: true,
            ingredients: ['chicken', 'BBQ sauce', 'red onions', 'mozzarella'],
            allergens: ['dairy', 'wheat'],
            dietary: [],
            tags: ['bbq', 'chicken'],
            rating: { average: 4.6, count: 167 }
          }
        ]
      },
      {
        name: 'Burger Hub',
        description: 'Gourmet burgers made with fresh ingredients. Juicy patties and crispy fries.',
        business_type: 'restaurant',
        category: ['food', 'restaurant', 'american', 'fast-food'],
        tags: ['burgers', 'american', 'fast-food'],
        address: {
          street: '321 Churchill Avenue',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0158, lng: 38.7578 }
        },
        contact: {
          phone: '+251933456789',
          email: 'burger@example.com',
          website: 'www.burgerhub.com'
        },
        menuItems: [
          {
            name: 'Classic Burger',
            description: 'Beef patty with lettuce, tomato, onion, pickles, and special sauce. Served with fries.',
            price: 150,
            category: 'Burgers',
            preparation_time: 15,
            is_available: true,
            is_popular: true,
            is_signature: true,
            ingredients: ['beef patty', 'lettuce', 'tomato', 'onion', 'pickles', 'special sauce', 'bun'],
            allergens: ['wheat', 'eggs'],
            dietary: [],
            tags: ['classic', 'signature'],
            rating: { average: 4.5, count: 278 }
          },
          {
            name: 'Cheese Burger',
            description: 'Classic burger with melted cheddar cheese. Simple and satisfying.',
            price: 170,
            category: 'Burgers',
            preparation_time: 15,
            is_available: true,
            is_popular: true,
            ingredients: ['beef patty', 'cheddar cheese', 'lettuce', 'tomato', 'onion', 'bun'],
            allergens: ['dairy', 'wheat', 'eggs'],
            dietary: [],
            tags: ['cheese', 'popular'],
            rating: { average: 4.6, count: 245 }
          },
          {
            name: 'Bacon Burger',
            description: 'Juicy beef patty with crispy bacon, cheese, and all the fixings.',
            price: 200,
            category: 'Burgers',
            preparation_time: 18,
            is_available: true,
            is_popular: true,
            ingredients: ['beef patty', 'bacon', 'cheddar cheese', 'lettuce', 'tomato', 'onion', 'bun'],
            allergens: ['dairy', 'wheat', 'eggs'],
            dietary: [],
            tags: ['bacon', 'loaded'],
            rating: { average: 4.7, count: 198 }
          },
          {
            name: 'Chicken Burger',
            description: 'Grilled chicken breast with lettuce, tomato, and mayo. A lighter option.',
            price: 160,
            category: 'Burgers',
            preparation_time: 15,
            is_available: true,
            ingredients: ['chicken breast', 'lettuce', 'tomato', 'mayo', 'bun'],
            allergens: ['wheat', 'eggs'],
            dietary: [],
            tags: ['chicken', 'light'],
            rating: { average: 4.4, count: 156 }
          },
          {
            name: 'Veggie Burger',
            description: 'Plant-based patty with fresh vegetables and special sauce. Perfect for vegetarians.',
            price: 140,
            category: 'Burgers',
            preparation_time: 12,
            is_available: true,
            ingredients: ['veggie patty', 'lettuce', 'tomato', 'onion', 'special sauce', 'bun'],
            allergens: ['wheat'],
            dietary: ['vegetarian', 'vegan'],
            tags: ['vegetarian', 'vegan'],
            rating: { average: 4.3, count: 112 }
          },
          {
            name: 'French Fries',
            description: 'Crispy golden fries served with ketchup. Perfect side dish.',
            price: 50,
            category: 'Sides',
            preparation_time: 10,
            is_available: true,
            is_popular: true,
            ingredients: ['potatoes', 'salt', 'oil'],
            allergens: [],
            dietary: ['vegetarian', 'vegan'],
            tags: ['side', 'popular'],
            rating: { average: 4.5, count: 342 }
          }
        ]
      },
      {
        name: 'Fresh Market Grocery',
        description: 'Your one-stop shop for fresh produce, groceries, and household essentials. Quality products at affordable prices.',
        business_type: 'grocery',
        category: ['grocery', 'food', 'essentials'],
        tags: ['fresh', 'affordable', 'convenient'],
        address: {
          street: '123 Market Street',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0123, lng: 38.7234 }
        },
        contact: {
          phone: '+251911111111',
          email: 'freshmarket@example.com',
          website: 'www.freshmarket.com'
        },
        menuItems: [
          {
            name: 'Fresh Tomatoes (1kg)',
            description: 'Fresh, locally grown tomatoes. Perfect for cooking and salads.',
            price: 45,
            category: 'Vegetables',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['tomatoes'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal'],
            tags: ['fresh', 'vegetables'],
            rating: { average: 4.5, count: 156 }
          },
          {
            name: 'Bananas (1kg)',
            description: 'Sweet, ripe bananas. Great for snacking or smoothies.',
            price: 35,
            category: 'Fruits',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['bananas'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal'],
            tags: ['fresh', 'fruits'],
            rating: { average: 4.6, count: 203 }
          },
          {
            name: 'Milk (1L)',
            description: 'Fresh whole milk. Perfect for your daily needs.',
            price: 55,
            category: 'Dairy',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['milk'],
            allergens: ['dairy'],
            dietary: ['halal'],
            tags: ['dairy', 'fresh'],
            rating: { average: 4.4, count: 189 }
          },
          {
            name: 'Bread (Loaf)',
            description: 'Fresh baked bread. Soft and delicious.',
            price: 25,
            category: 'Bakery',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['wheat flour', 'yeast', 'water', 'salt'],
            allergens: ['wheat', 'gluten'],
            dietary: ['vegetarian', 'halal'],
            tags: ['bakery', 'fresh'],
            rating: { average: 4.5, count: 178 }
          },
          {
            name: 'Rice (5kg)',
            description: 'Premium quality rice. Long grain and aromatic.',
            price: 280,
            category: 'Grains',
            preparation_time: 0,
            is_available: true,
            ingredients: ['rice'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
            tags: ['staple', 'grains'],
            rating: { average: 4.7, count: 134 }
          },
          {
            name: 'Cooking Oil (1L)',
            description: 'Pure vegetable cooking oil. For all your cooking needs.',
            price: 120,
            category: 'Cooking Essentials',
            preparation_time: 0,
            is_available: true,
            ingredients: ['vegetable oil'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal'],
            tags: ['cooking', 'essentials'],
            rating: { average: 4.5, count: 112 }
          }
        ]
      },
      {
        name: 'Health Plus Pharmacy',
        description: 'Your trusted pharmacy for medicines, health supplements, and personal care products. Licensed pharmacists available.',
        business_type: 'pharmacy',
        category: ['pharmacy', 'health', 'medical'],
        tags: ['licensed', 'trusted', 'health'],
        address: {
          street: '456 Health Avenue',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0234, lng: 38.7345 }
        },
        contact: {
          phone: '+251922222222',
          email: 'healthplus@example.com',
          website: 'www.healthplus.com'
        },
        menuItems: [
          {
            name: 'Paracetamol 500mg (20 tablets)',
            description: 'Pain reliever and fever reducer. Fast-acting and effective.',
            price: 35,
            category: 'Medicines',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['paracetamol'],
            allergens: [],
            dietary: [],
            tags: ['pain-relief', 'fever'],
            rating: { average: 4.6, count: 245 }
          },
          {
            name: 'Vitamin C 1000mg (30 tablets)',
            description: 'Immune system support. High potency vitamin C supplement.',
            price: 180,
            category: 'Vitamins',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['vitamin C'],
            allergens: [],
            dietary: ['vegetarian', 'vegan'],
            tags: ['immune', 'vitamins'],
            rating: { average: 4.5, count: 198 }
          },
          {
            name: 'First Aid Kit',
            description: 'Complete first aid kit with bandages, antiseptics, and essential medical supplies.',
            price: 450,
            category: 'First Aid',
            preparation_time: 0,
            is_available: true,
            ingredients: ['bandages', 'antiseptic', 'gauze', 'tape'],
            allergens: [],
            dietary: [],
            tags: ['first-aid', 'essential'],
            rating: { average: 4.7, count: 89 }
          },
          {
            name: 'Hand Sanitizer 500ml',
            description: 'Alcohol-based hand sanitizer. Kills 99.9% of germs.',
            price: 120,
            category: 'Personal Care',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['alcohol', 'glycerin'],
            allergens: [],
            dietary: [],
            tags: ['hygiene', 'sanitizer'],
            rating: { average: 4.6, count: 167 }
          }
        ]
      },
      {
        name: 'Tech World Electronics',
        description: 'Latest smartphones, laptops, accessories, and electronics. Authorized dealer with warranty.',
        business_type: 'electronics',
        category: ['electronics', 'technology', 'devices'],
        tags: ['authorized', 'warranty', 'latest'],
        address: {
          street: '789 Tech Boulevard',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0345, lng: 38.7456 }
        },
        contact: {
          phone: '+251933333333',
          email: 'techworld@example.com',
          website: 'www.techworld.com'
        },
        menuItems: [
          {
            name: 'Wireless Earbuds',
            description: 'High-quality wireless earbuds with noise cancellation. Long battery life.',
            price: 2500,
            category: 'Audio',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['wireless', 'audio', 'popular'],
            rating: { average: 4.6, count: 234 }
          },
          {
            name: 'USB-C Cable (2m)',
            description: 'Fast charging USB-C cable. Compatible with all USB-C devices.',
            price: 350,
            category: 'Accessories',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['cable', 'charging'],
            rating: { average: 4.5, count: 189 }
          },
          {
            name: 'Phone Case (Universal)',
            description: 'Protective phone case with shock absorption. Fits most smartphones.',
            price: 450,
            category: 'Accessories',
            preparation_time: 0,
            is_available: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['protection', 'case'],
            rating: { average: 4.4, count: 156 }
          },
          {
            name: 'Power Bank 10000mAh',
            description: 'Portable power bank. Fast charging for your devices on the go.',
            price: 1800,
            category: 'Accessories',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['power', 'portable'],
            rating: { average: 4.7, count: 178 }
          }
        ]
      },
      {
        name: 'Fashion Hub',
        description: 'Trendy clothing for men, women, and kids. Latest fashion trends at great prices.',
        business_type: 'clothing',
        category: ['clothing', 'fashion', 'apparel'],
        tags: ['trendy', 'affordable', 'fashion'],
        address: {
          street: '321 Fashion Street',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0456, lng: 38.7567 }
        },
        contact: {
          phone: '+251944444444',
          email: 'fashionhub@example.com',
          website: 'www.fashionhub.com'
        },
        menuItems: [
          {
            name: 'Cotton T-Shirt',
            description: 'Comfortable 100% cotton t-shirt. Available in multiple colors and sizes.',
            price: 450,
            category: 'Men',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['cotton', 'casual', 'popular'],
            rating: { average: 4.5, count: 198 }
          },
          {
            name: 'Denim Jeans',
            description: 'Classic fit denim jeans. Durable and stylish.',
            price: 1200,
            category: 'Men',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['denim', 'classic'],
            rating: { average: 4.6, count: 167 }
          },
          {
            name: 'Summer Dress',
            description: 'Light and airy summer dress. Perfect for warm weather.',
            price: 850,
            category: 'Women',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['summer', 'dress'],
            rating: { average: 4.5, count: 145 }
          },
          {
            name: 'Running Shoes',
            description: 'Comfortable running shoes with good support. Perfect for sports and daily wear.',
            price: 2500,
            category: 'Shoes',
            preparation_time: 0,
            is_available: true,
            ingredients: [],
            allergens: [],
            dietary: [],
            tags: ['sports', 'shoes'],
            rating: { average: 4.7, count: 123 }
          }
        ]
      },
      {
        name: 'Bloom Flower Shop',
        description: 'Beautiful fresh flowers and gift arrangements. Perfect for any occasion.',
        business_type: 'flowers',
        category: ['flowers', 'gifts', 'decorations'],
        tags: ['fresh', 'beautiful', 'gifts'],
        address: {
          street: '567 Garden Road',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0567, lng: 38.7678 }
        },
        contact: {
          phone: '+251955555555',
          email: 'bloom@example.com',
          website: 'www.bloomflowers.com'
        },
        menuItems: [
          {
            name: 'Rose Bouquet (12 roses)',
            description: 'Beautiful red roses arranged in a stunning bouquet. Perfect for expressing love.',
            price: 800,
            category: 'Bouquets',
            preparation_time: 15,
            is_available: true,
            is_popular: true,
            is_signature: true,
            ingredients: ['roses', 'greenery', 'ribbon'],
            allergens: [],
            dietary: [],
            tags: ['roses', 'romantic', 'signature'],
            rating: { average: 4.8, count: 234 }
          },
          {
            name: 'Mixed Flower Arrangement',
            description: 'Colorful mix of seasonal flowers. Bright and cheerful.',
            price: 650,
            category: 'Bouquets',
            preparation_time: 20,
            is_available: true,
            is_popular: true,
            ingredients: ['mixed flowers', 'greenery'],
            allergens: [],
            dietary: [],
            tags: ['mixed', 'colorful'],
            rating: { average: 4.6, count: 189 }
          },
          {
            name: 'Birthday Gift Set',
            description: 'Flowers, card, and small gift. Perfect birthday surprise.',
            price: 1200,
            category: 'Gifts',
            preparation_time: 25,
            is_available: true,
            ingredients: ['flowers', 'card', 'gift'],
            allergens: [],
            dietary: [],
            tags: ['birthday', 'gift-set'],
            rating: { average: 4.7, count: 156 }
          }
        ]
      },
      {
        name: 'Quick Stop Convenience',
        description: '24/7 convenience store. Snacks, beverages, and daily essentials. Always open.',
        business_type: 'convenience',
        category: ['convenience', 'snacks', 'essentials'],
        tags: ['24/7', 'convenient', 'essentials'],
        address: {
          street: '890 Main Street',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          zipCode: '1000',
          country: 'Ethiopia',
          coordinates: { lat: 9.0678, lng: 38.7789 }
        },
        contact: {
          phone: '+251966666666',
          email: 'quickstop@example.com',
          website: 'www.quickstop.com'
        },
        menuItems: [
          {
            name: 'Coca Cola (500ml)',
            description: 'Refreshing cola drink. Ice cold.',
            price: 25,
            category: 'Beverages',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['carbonated water', 'sugar', 'flavoring'],
            allergens: [],
            dietary: ['halal'],
            tags: ['soft-drink', 'popular'],
            rating: { average: 4.4, count: 312 }
          },
          {
            name: 'Chips (Regular)',
            description: 'Crispy potato chips. Classic flavor.',
            price: 35,
            category: 'Snacks',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['potatoes', 'salt', 'oil'],
            allergens: [],
            dietary: ['vegetarian', 'halal'],
            tags: ['chips', 'snacks'],
            rating: { average: 4.5, count: 278 }
          },
          {
            name: 'Chocolate Bar',
            description: 'Milk chocolate bar. Sweet and satisfying.',
            price: 45,
            category: 'Snacks',
            preparation_time: 0,
            is_available: true,
            ingredients: ['chocolate', 'milk', 'sugar'],
            allergens: ['dairy'],
            dietary: ['vegetarian', 'halal'],
            tags: ['chocolate', 'sweet'],
            rating: { average: 4.6, count: 198 }
          },
          {
            name: 'Bottled Water (1L)',
            description: 'Pure drinking water. Essential for hydration.',
            price: 15,
            category: 'Beverages',
            preparation_time: 0,
            is_available: true,
            is_popular: true,
            ingredients: ['water'],
            allergens: [],
            dietary: ['vegetarian', 'vegan', 'halal'],
            tags: ['water', 'essential'],
            rating: { average: 4.5, count: 456 }
          }
        ]
      }
    ];

    // Create businesses and their menu items
    for (const businessData of businesses) {
      const { menuItems, ...businessInfo } = businessData;
      
      const business = await Business.create({
        ...businessInfo,
        owner_id: businessOwner.id,
        images: {
          logo: '',
          cover: '',
          gallery: []
        },
        operating_hours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '22:00' },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '22:00' },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '22:00' },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '22:00' },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '23:00' },
          { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
          { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '21:00' }
        ],
        delivery_info: {
          deliveryRadius: 10,
          minimumOrder: 50,
          deliveryFee: 20,
          freeDeliveryThreshold: 500,
          estimatedDeliveryTime: { min: 30, max: 45 },
          deliveryTypes: ['standard', 'express']
        },
        rating: {
          average: 4.5 + (Math.random() * 0.5),
          count: Math.floor(Math.random() * 100) + 50
        },
        total_orders: Math.floor(Math.random() * 200) + 50,
        revenue: {
          total: Math.floor(Math.random() * 50000) + 10000,
          thisMonth: Math.floor(Math.random() * 10000) + 2000
        },
        is_active: true,
        is_verified: true,
        is_featured: true,
        verification_status: 'verified',
        documents: {
          businessLicense: '',
          taxId: ''
        },
        bank_details: {
          accountHolder: businessInfo.name,
          accountNumber: Math.floor(Math.random() * 9000000000) + 1000000000,
          bankName: 'Sample Bank',
          routingNumber: Math.floor(Math.random() * 900000000) + 100000000
        },
        settings: {
          acceptsOrders: true,
          autoAcceptOrders: false,
          preparationTime: 30,
          maxOrdersPerHour: 20
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        metrics: {
          views: Math.floor(Math.random() * 2000) + 500,
          clicks: Math.floor(Math.random() * 500) + 100,
          conversionRate: Math.floor(Math.random() * 30) + 10
        }
      });
      
      console.log(`Created business: ${business.name}`);
      
      // Create menu categories
      const categories = [...new Set(menuItems.map(item => item.category))];
      for (const categoryName of categories) {
        await MenuCategory.create({
          name: categoryName,
          description: `${categoryName} from ${business.name}`,
          business_id: business.id,
          is_active: true,
          sort_order: categories.indexOf(categoryName)
        });
      }
      
      // Create menu items
      for (const itemData of menuItems) {
        await MenuItem.create({
          ...itemData,
          business_id: business.id,
          order_count: Math.floor(Math.random() * 100) + 10
        });
        console.log(`  - Created menu item: ${itemData.name} (${itemData.price} ETB)`);
      }
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users created: 4 (Admin, Business Owner, Delivery Person, Customer)`);
    console.log(`   - Businesses created: ${businesses.length}`);
    console.log(`   - Total menu items: ${businesses.reduce((sum, b) => sum + b.menuItems.length, 0)}`);
    console.log(`\n🔑 Test Credentials:`);
    console.log(`   Admin: admin@example.com / admin123`);
    console.log(`   Business Owner: owner@example.com / owner123`);
    console.log(`   Customer: customer@example.com / customer123`);
    console.log(`\n⚠️  Remember to change these passwords in production!`);
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
};

// Run seed if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) ||
                     process.argv[1].includes('seedDatabase.js');

if (isMainModule || process.argv[1]?.includes('seedDatabase')) {
  seedDatabase().then(() => {
    console.log('Seeding process finished');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });
}