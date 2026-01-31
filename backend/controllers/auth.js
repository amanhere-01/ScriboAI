const { createToken, validateToken } = require("../services/jwtAuthentication.js");
const db = require("../services/db.js");
const bcrypt = require("bcrypt");

async function handleUserSignUp(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users(username, email, password, auth_provider) VALUES (?, ?, ?, 'LOCAL')",
      [username, email, hashedPassword]
    );
    console.log(`User has been created with ID: ${result.insertId}`);

    return res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}


async function handleUserSignIn(req, res){
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try{
    
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?",[email]);
    if(rows.length === 0){
      return res.status(400).json({error: "Invalid email"});
    }

    const user = rows[0];
    
    if(user.auth_provider !== "LOCAL"){
      return res.status(400).json({
        error : "Login through Google Account"
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = createToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
    })

    return res.status(200).json({
      message: "Login successful",
      user: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function handleUserSignOut(req, res){
  try{
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Lax'
    })

    res.status(200).json({message: "Logged out successfully"});
  } catch(error){
      console.log(`LogOut Error: ${error.message}`);
      res.status(500).json({error: "Logout failed"});
  }
}

async function handleGoogleAuth(req,res){
  const user = req.user;

  console.log("--------------------------REQ.USER: controller/auth.js", user);

  const token = createToken(user);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
  })

  res.redirect("http://localhost:5173/oauth/success");
}

async function handleAuthMe(req,res){
  try{
    const token = req.cookies.token;
    if(!token){
      return res.status(401).json({error : "Not authenticated"});
    }

    const payload = validateToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const [rows] = await db.query('SELECT * FROM users where id = ?', [payload.id]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

module.exports = { handleUserSignUp, handleUserSignIn, handleUserSignOut, handleGoogleAuth, handleAuthMe };
