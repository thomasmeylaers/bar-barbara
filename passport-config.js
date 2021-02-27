const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Bills = require('./models/bills');

function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false, {message:"no user found"})
        }
        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message:"password is not correct"})
            }
        } catch (error) {
            return done(error)
        }
    }
    passport.use(new localStrategy({ usernameField:'username'}, authenticateUser))
    passport.serializeUser((user,done)=>done(null, user.id))
    passport.deserializeUser((id,done)=>{
        return done(null, getUserById(id))
    });
}

module.exports = initialize;