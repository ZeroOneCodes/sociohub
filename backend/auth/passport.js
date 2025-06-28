require("dotenv").config();
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const LinkedInStrategy = require("../lib/index").Strategy;
const TwitterProfile = require('../models/TwitterProfile.js');
const LinkedInProfile = require('../models/LinkedProfile.js');
const  Users = require('../models/Users');

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
  includeEmail: true
},async function(token, tokenSecret, profile, done) {
  try {
    const user = await Users.findOne({
      where: { email: profile._json.email || '' },
    });

    if (!user) {
      return done(new Error('User not found with this email'), null);
    }

    const twitterProfileData = {
      user_id: user.user_id,
      name: profile._json.name || '',
      screen_name: profile._json.screen_name || '',
      location: profile._json.location || '',
      description: profile._json.description || '',
      protected: profile._json.protected || false,
      followers_count: profile._json.followers_count || 0,
      friends_count: profile._json.friends_count || 0,
      listed_count: profile._json.listed_count || 0,
      favourites_count: profile._json.favourites_count || 1,
      verified: profile._json.verified || false,
      statuses_count: profile._json.statuses_count || 0,
      lang: profile._json.lang || null,
      following: profile._json.following || false,
      follow_request_sent: profile._json.follow_request_sent || false,
      notifications: profile._json.notifications || false,
      translator_type: profile._json.translator_type || 'none',
      suspended: profile._json.suspended || false,
      needs_phone_verification: profile._json.needs_phone_verification || false,
      email: profile._json.email || '',
      twitter_token: token || '',
      twitter_secret: tokenSecret || ''
    };

    const [twitterProfile, created] = await TwitterProfile.upsert(twitterProfileData, {
      returning: true,
      conflictFields: ['user_id'],
      logging: console.log
    });

    const userData = {
      ...user.get({ plain: true }),
      twitterProfile: twitterProfile.get({ plain: true })
    };
    
    return done(null, userData);
  } catch (error) {
    console.error('Twitter authentication error:', error);
    return done(error, null);
  }
}));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['openid', 'profile', 'email', 'w_member_social'],
  state: true
}, async function(accessToken, refreshToken, profile, done) {
  try {
    const user = await Users.findOne({
      where: { email: profile._json.email || '' }
    });

    if (!user) {
      return done(new Error('User not found with this email'), null);
    }

    const linkedinProfileData = {
      user_id: user.user_id,
      sub: profile._json.sub || '',
      email_verified: profile._json.email_verified || false,
      name: profile._json.name || '',
      given_name: profile._json.given_name || '',
      family_name: profile._json.family_name || '',
      email: profile._json.email || '',
      picture: profile._json.picture || null,
      country: profile._json.locale?.country || '',
      language: profile._json.locale?.language || '',
      access_token: accessToken || '',
      refresh_token: refreshToken || ''
    };

    const [linkedinProfile, created] = await LinkedInProfile.upsert(linkedinProfileData, {
      returning: true,
      conflictFields: ['user_id'],
      logging: console.log
    });

    const userData = {
      ...user.get({ plain: true }),
      linkedinProfile: linkedinProfile.get({ plain: true }),
      accessToken
    };

    return done(null, userData);
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    return done(error, null);
  }
}));

// Instagram
// passport.use(new InstagramStrategy({
//   clientID: process.env.INSTAGRAM_CLIENT_ID,
//   clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
//   callbackURL: process.env.INSTAGRAM_CALLBACK_URL,
//   scope: ['user_profile', 'user_media'], // Instagram specific scopes
//   state: true
// }, async function(accessToken, refreshToken, profile, done) {
//   try {
//     // Instagram profile structure is different from LinkedIn
//     const user = await Users.findOne({
//       where: { email: profile.username + '@instagram.com' } // Instagram doesn't provide email by default
//     });

//     if (!user) {
//       // You might want to create a new user here or handle differently
//       return done(new Error('User not found'), null);
//     }

//     const instagramProfileData = {
//       user_id: user.user_id,
//       instagram_id: profile.id,
//       username: profile.username,
//       display_name: profile.displayName,
//       profile_picture: profile._json.data?.profile_picture || null,
//       access_token: accessToken,
//       refresh_token: refreshToken || ''
//     };

//     const [instagramProfile, created] = await InstagramProfile.upsert(instagramProfileData, {
//       returning: true,
//       conflictFields: ['user_id'],
//       logging: console.log
//     });

//     const userData = {
//       ...user.get({ plain: true }),
//       instagramProfile: instagramProfile.get({ plain: true }),
//       accessToken
//     };

//     return done(null, userData);
//   } catch (error) {
//     console.error('Instagram authentication error:', error);
//     return done(error, null);
//   }
// }));

// Facebook
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//   profileFields: ['id', 'emails', 'name', 'displayName', 'photos'], // Fields to request
//   scope: ['email', 'public_profile'], // Permissions
//   state: true // CSRF protection
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     // Facebook may not always return an email, so we check
//     const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;

//     // Find or create the user
//     let user = await Users.findOne({ where: { email } });

//     if (!user) {
//       // Optionally create a new user if not found
//       user = await Users.create({
//         email,
//         name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
//         // Add other fields as needed
//       });
//     }

//     // Store Facebook profile data
//     const facebookProfileData = {
//       user_id: user.user_id,
//       facebook_id: profile.id,
//       email: email,
//       display_name: profile.displayName,
//       first_name: profile.name?.givenName || '',
//       last_name: profile.name?.familyName || '',
//       profile_picture: profile.photos?.[0]?.value || null,
//       access_token: accessToken,
//       refresh_token: refreshToken || ''
//     };

//     // Upsert the Facebook profile
//     const [facebookProfile, created] = await FacebookProfile.upsert(facebookProfileData, {
//       returning: true,
//       conflictFields: ['user_id'],
//       logging: console.log
//     });

//     const userData = {
//       ...user.get({ plain: true }),
//       facebookProfile: facebookProfile.get({ plain: true }),
//       accessToken
//     };

//     return done(null, userData);
//   } catch (error) {
//     console.error('Facebook authentication error:', error);
//     return done(error, null);
//   }
// }));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
