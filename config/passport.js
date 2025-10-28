// config/passport.js
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");
const sendDiscordMessage = require('../utils/discordNotifier');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // from Google Cloud Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        const existingUser = await User.findByEmail(profile.emails[0].value);

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create a new user record if not found
        const newUser = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          password: null, // no password for Google users
          role: "user",
          email_verified: true, // Google already verifies email
          verificationToken: null,
          verificationTokenExpires: null,
        });
        sendDiscordMessage('new_user', {username: newUser.username});
        return done(null, newUser);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

// serialize/deserialize (for Passport session if needed)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
