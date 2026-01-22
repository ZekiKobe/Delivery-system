# Database Seeders

This directory contains seed scripts for populating the database with initial/test data.

## ⚠️ Important Notes

- **Seed scripts are for development/testing only**
- **Never run seeders in production**
- Seed scripts will **DELETE all existing data** before seeding
- Use these scripts only in development environments

## Available Seeders

### `seedDatabase.js`
Seeds the database with:
- Admin user (admin@example.com / admin123)
- Business owner (owner@example.com / owner123)
- Delivery person (delivery@example.com / delivery123)
- Customer (customer@example.com / customer123)
- Sample business and related data

### `termsSeed.js`
Seeds terms and conditions data.

## Usage

To run a seeder:
```bash
npm run seed          # Run seedDatabase.js
npm run seed:terms    # Run termsSeed.js
```

Or directly:
```bash
node seeders/seedDatabase.js
node seeders/termsSeed.js
```

## Security Warning

⚠️ **These seeders contain hardcoded passwords and test data.**
- Change all passwords after seeding
- Remove or secure seed scripts before production deployment
- Never commit seed scripts with real user data

