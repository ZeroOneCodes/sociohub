const { inherits } = require('util');
const OAuth2Strategy = require('passport-oauth2');
const { InternalOAuthError } = require('passport-oauth2');

const profileUrl = 'https://api.linkedin.com/v2/userinfo';

function Strategy(options = {}, verify) {
  options.authorizationURL =
    options.authorizationURL ||
    'https://www.linkedin.com/oauth/v2/authorization';
  options.tokenURL =
    options.tokenURL || 'https://www.linkedin.com/oauth/v2/accessToken';
  options.scope = options.scope || ['profile', 'email', 'openid'];

  options.customHeaders = options.customHeaders || { 'x-li-format': 'json' };

  OAuth2Strategy.call(this, options, verify);

  this.name = 'linkedin';
  this.profileUrl = profileUrl;
}

// Inherit from OAuth2Strategy
inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.setAccessTokenName('oauth2_access_token');

  this._oauth2.get(this.profileUrl, accessToken, (err, body, _res) => {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }

    let profile;
    try {
      profile = parseProfile(body);
    } catch (e) {
      return done(new InternalOAuthError('failed to parse profile response', e));
    }

    done(null, profile);
  });
};

Strategy.prototype.authorizationParams = function (options) {
  const params = {};

  if (options.state) {
    params['state'] = options.state;
  }

  return params;
};

function parseProfile(body) {
  const json = JSON.parse(body);

  return {
    provider: 'linkedin',
    id: json.sub,
    email: json.email,
    givenName: json.given_name,
    familyName: json.family_name,
    displayName: `${json.given_name} ${json.family_name}`,
    picture: json.picture,
    _raw: body,
    _json: json,
  };
}

module.exports = Strategy;
