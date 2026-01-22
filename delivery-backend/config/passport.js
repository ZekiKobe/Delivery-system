import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateRandomPassword } from '../utils/password.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Debug environment variables
console.log('🔍 Checking OAuth environment variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Initializing Google OAuth strategy...');
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/oauth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 
        where: {
          [Op.or]: [
            { google_id: profile.id },
            { email: profile.emails[0].value }
          ]
        }
      });

      if (user) {
        // User exists, update Google ID if not set
        if (!user.google_id) {
          user.google_id = profile.id;
          // Update social auth data
          user.social_auth = user.social_auth || {};
          user.social_auth.providers = user.social_auth.providers || [];
          if (!user.social_auth.providers.includes('google')) {
            user.social_auth.providers.push('google');
          }
        }
        
        // Check if profile is incomplete (missing phone)
        if (!user.phone || user.phone.trim() === '') {
          user.profile_incomplete = true;
        }
        
        await user.save();
        return done(null, user);
      }

      // Create new user
      const newUser = await User.create({
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        email: profile.emails[0].value,
        password: generateRandomPassword(), // Generate random password for OAuth users
        phone: '', // Empty string for OAuth users - will be required to complete profile later
        avatar: profile.photos[0]?.value,
        is_email_verified: true, // Trust Google verification
        is_phone_verified: false, // Phone not provided yet
        google_id: profile.id,
        social_auth: {
          providers: ['google']
        },
        role: 'customer', // Default role
        profile_incomplete: true // Flag to indicate profile needs completion
      });

      return done(null, newUser);

    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
  console.log('✅ Google OAuth strategy initialized successfully');
} else {
  console.log('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;