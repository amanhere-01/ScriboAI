const { createToken } = require("../configs/jwtAuthentication.js");
const db = require("../configs/db.js");
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
      "INSERT INTO users(username, email, password) VALUES (?, ?, ?)",
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
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = createToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
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


module.exports = { handleUserSignUp, handleUserSignIn };
