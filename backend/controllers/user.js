const db = require("../services/db");

async function getAllUser(req, res){
  try{
    const [rows] = await db.query('SELECT * FROM users');
    return res.status(200).json({users: rows});
  } 
  catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
}

async function getUserById(req, res){
  const userId = req.params.userId;

  try{
    const [rows] = await db.query('SELECT * FROM users WHERE id=?',[userId]);
    return res.status(200).json(rows);
  }
  catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
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
    res.status(500).send("DB Error");
  }
}

async function getUserProfile(req, res){
  const userId = req.user.id;

  try{
    const [rows] = await db.query('SELECT * FROM users WHERE id=?', [userId]);
    return res.status(200).json(rows);
  }
  catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
}

module.exports = {getAllUser, getUserById, getUserDocs, getUserProfile}