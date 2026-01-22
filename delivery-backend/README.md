# Delivery System Backend

This is the backend API for the Delivery System, built with Node.js, Express, and SQL (Sequelize).

## Features

- User authentication and authorization
- Business management
- Order processing
- Payment integration with Stripe
- Real-time updates with Socket.IO
- Image uploads with Cloudinary
- Email notifications

## Database

This backend now uses SQL databases (via Sequelize) instead of MongoDB. The supported databases include:

- MySQL
- PostgreSQL
- SQLite
- Microsoft SQL Server

### Migration Commands

```bash
# Run pending migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Undo all migrations
npm run migrate:undo:all
```

### Environment Variables

Add these to your `.env` file for SQL database support:

```env
# SQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=delivery_system
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Create the database in your SQL server
5. Run migrations: `npm run migrate`
6. Run the server: `npm start` or `npm run dev`

## API Documentation

API endpoints are documented at `/api` when the server is running.

## Testing

Run tests with `npm test`.

## License

MIT