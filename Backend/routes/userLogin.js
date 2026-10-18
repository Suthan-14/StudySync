const express = require("express");
const passport = require("passport");

const {
    signup,
    login,
    Streak,
    googleCallback,
    googleUser
} = require("../controller/usercontroller");

const {
    authMiddleware
} = require("../controller/auth");

const route = express.Router();

route.post('/signup', signup);

route.post('/login', login);

route.get('/streak', authMiddleware, Streak);


route.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

route.get(
    '/auth/google/user',
    authMiddleware,
    googleUser
);

route.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: 'http://localhost:5173/login'
    }),
    googleCallback
);


module.exports = route;