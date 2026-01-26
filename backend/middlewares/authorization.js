const { validateToken } = require("../services/jwtAuthentication");

function checkAuthentication(req,res,next){
  const token = req.cookies?.token;

  if(!token){
    return res.status(401).json({message: 'Please login to continue'});
  }

  const payload = validateToken(token);

  req.user = payload;

  return next();
}

function checkAuthorization(role){
  return function(req, res, next){
    // console.log(req.user);
    // if(!req.user){
    //   return res.status(401).json({message: 'Please log in to continue'});
    // }
    if(req.user.role!==role){
      return res.status(401).json({message: 'Unauthorized access'});
    }

    return next();
  }
}


module.exports = {
  checkAuthentication,
  checkAuthorization,
}