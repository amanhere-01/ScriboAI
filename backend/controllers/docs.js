const db = require("../configs/db");


async function getAllDocs(req, res){
  try{
    const [rows] = await db.query('SELECT * FROM docs');
    return res.status(200).json({users: rows});
  }
  catch{
    console.error(err);
    res.status(500).send("DB Error");
  }
}

async function handleDocSaving(req, res){
  const { title, content } = req.body;
  const ownerId = req.user.id;
  try{
    const [result] = await db.query('INSERT INTO docs(title, content, owner_id) VALUES (?, ?, ?)', [title, content, ownerId]);
    return res.status(201).json({
      message: "Document saved",
      docId: result.insertId,
    });
  } 
  catch{
    console.error(err);
    res.status(500).send("DB Error");
  }
}

async function getDocById(req, res){
  const docId = req.params.docId;
  try{
    const [rows] = await db.query('SELECT * FROM docs WHERE id=?', [docId]);
    return res.status(200).json({users: rows});
  }
  catch{
    console.error(err);
    res.status(500).send("DB Error");
  }
}

module.exports = {getAllDocs, getDocById, handleDocSaving}