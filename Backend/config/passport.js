const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const model = require("../model/Schema");

require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                let user = await model.findOne({
                    googleId: profile.id
                });

                if (user) {
                    return done(null, user);
                }

                user = await model.findOne({
                    email: profile.emails[0].value
                });

                if (user) {

                    user.googleId = profile.id;
                    user.profileImage =
                        profile.photos?.[0]?.value || null;

                    await user.save();

                    return done(null, user);
                }

                const newUser = new model({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profileImage:
                        profile.photos?.[0]?.value || null,
                    authProvider: "google"
                });

                await newUser.save();

                return done(null, newUser);

            } catch (error) {

                return done(error, null);

            }

        }
    )
);

module.exports = passport;