import express from 'express';
import passport from '../config/passport.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

const router = express.Router();

// Middleware to check if OAuth strategy is available
const checkOAuthStrategy = (strategyName) => {
  return (req, res, next) => {
    // Check environment variables directly - more reliable than passport internal state
    let isConfigured = false;
    
    if (strategyName === 'google') {
      isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    }
    
    if (!isConfigured) {
      return res.status(501).json({
        success: false,
        message: `${strategyName} OAuth is not configured. Please contact administrator.`,
        error: 'OAUTH_NOT_CONFIGURED'
      });
    }
    
    next();
  };
};

// Handle HEAD requests for availability checking (must come before GET)
router.head('/google', checkOAuthStrategy('google'), (req, res) => {
  res.status(200).end();
});

// Google OAuth Routes
router.get('/google', 
  checkOAuthStrategy('google'),
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  checkOAuthStrategy('google'),
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate JWT tokens
      const token = generateToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Save refresh token
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refresh=${refreshToken}&provider=google`;
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback_failed`);
    }
  }
);

// Link social account to existing user
router.post('/link/:provider', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const { provider } = req.params;
      const user = req.user;

      if (provider !== 'google') {
        return res.status(400).json({
          success: false,
          message: 'Invalid OAuth provider'
        });
      }

      // This endpoint would be used to initiate linking process
      // The actual linking happens in the OAuth callback
      
      res.json({
        success: true,
        message: `Initiate ${provider} account linking`,
        linkUrl: `/api/auth/oauth/${provider}?link=true&userId=${user.id}`
      });

    } catch (error) {
      console.error('OAuth link error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate account linking'
      });
    }
  }
);

// Unlink social account
router.delete('/unlink/:provider',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { provider } = req.params;
      const user = req.user;

      if (provider !== 'google') {
        return res.status(400).json({
          success: false,
          message: 'Invalid OAuth provider'
        });
      }

      // Remove provider from user's social auth
      if (user.social_auth && provider === 'google') {
        user.social_auth.googleId = undefined;
        user.social_auth.providers = user.social_auth.providers?.filter(p => p !== provider) || [];
      }

      await user.save();

      res.json({
        success: true,
        message: `${provider} account unlinked successfully`
      });

    } catch (error) {
      console.error('OAuth unlink error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unlink social account'
      });
    }
  }
);

export default router;