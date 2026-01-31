const db = require("../services/db");

async function getAllUser(req, res){
  try{
    const [rows] = await db.query('SELECT * FROM users');
    return res.status(200).json({users: rows});
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({error: "Failed to get all user"});
  }
}

async function getUserById(req, res){
  const userId = req.params.userId;

  try{
    const [rows] = await db.query('SELECT * FROM users WHERE id=?',[userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(rows);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({error: "Failed to get user details"});
  }
}


async function getUserDocs(req, res){
  const userId = req.params.userId;

  try{
    const[rows] = await db.query('SELECT * FROM docs WHERE owner_id=?', [userId]);
    return res.status(200).json(rows);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({error: "Failed to get user dcouments"});
  }
}

async function getUserProfile(req, res){
  const userId = req.user.id;

  try{
    const [rows] = await db.query('SELECT * FROM users WHERE id=?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(rows);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({error: "Failed to get profile"});
  }
}

module.exports = {getAllUser, getUserById, getUserDocs, getUserProfile}