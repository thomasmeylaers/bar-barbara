const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Bills = require('./models/bills');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField:'username'},(username,password,done)=>{
            Bills.findOne({username:username})
            .then(user =>{
                if(!user) {
                    return done(null, false, {message:"that user does not extist"});
                }

                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        return done(null,user);
                    }  else {
                        return done(null,false,{message: "password incorrect"});
                    }
                });
            })
            .catch(err => console.log(err));
        })
    );
    passport.serializeUser(function(user,done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id,done) {
        Bills.findById(id, function(err,user)  {
            done(err,user);
        })
    })
}