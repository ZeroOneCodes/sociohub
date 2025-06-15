require("dotenv").config();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const LinkedInStrategy = require("../lib/index").Strategy;

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
  includeEmail: true
},
function(token, tokenSecret, profile, done) {
  console.log("TWITTER PROFILE",profile)
  // Save user to DB or session here
  return done(null, profile);
}));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['openid','profile','email', 'w_member_social'],
  state: true
}, function(accessToken, refreshToken, profile, done) {
  console.log("LINKEDIN PROFILE",profile)
  // Save the user or profile in DB if needed
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
