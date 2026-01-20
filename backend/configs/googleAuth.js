const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try{
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const username = profile.displayName;

        const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
        let user;
        if(rows.length === 0){  //new user
          const [result] = await db.query(
            "INSERT INTO users(username, email, google_id, auth_provider) VALUES (?,?,?,'GOOGLE')",
            [username, email, googleId]
          );

          user = {
            id : result.insertId,
            email,
            username
          }
        } else{
          user = rows[0];
          
          //Linking manually signed up email with google if user logsin with google with same email which was used for signup
          if(!user.google_id){
            await db.query(
              "UPDATE users SET google_id=? where email=?",
              [googleId, email]
            )
          }
        }

        return done(null, user);
      } 
      catch(err){
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
