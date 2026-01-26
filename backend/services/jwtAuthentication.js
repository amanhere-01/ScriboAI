const jwt = require('jsonwebtoken');

// const SECRET_KEY = process.env.JWT_SECRET_KEY;

function createToken(user){
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});

  return token;
}


function validateToken(token){
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return payload;
  } 
  catch (err) {
    return null;
  }
}


module.exports = { createToken, validateToken }
