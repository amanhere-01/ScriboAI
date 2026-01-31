const db = require("../services/db");

async function createNewDoc(req, res){
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = req.user.id;
  const { folderId } = req.body || {};
  
  try{
    let query;
    let params;

    if (folderId) {
      query = `INSERT INTO docs (owner_id, folder_id, title) VALUES (?, ?, 'Untitled Document')`;
      params = [userId, folderId];
    } else {
      query = `INSERT INTO docs (owner_id, title) VALUES (?, 'Untitled Document')`;
      params = [userId];
    }

    const[result] = await db.query(query, params);

    return res.status(201).json({
      message : "New document created",
      docId : result.insertId
    });

  } catch(err){
    console.error("Create doc error:", err);
    return res.status(500).json({error: "Failed to create document"});
  }
}

async function getDocById(req, res){
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const docId = req.params.docId;
  const userId = req.user.id;

  try{
    const [rows] = await db.query(
      `SELECT d.id, d.title, d.content FROM docs d WHERE d.id = ? AND d.owner_id = ? `,
      [docId, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.status(200).json({doc: rows[0]});
  } catch (err) {
    console.error("Get doc error:", err);
    return res.status(500).json({ error: "Failed to get document" });
  }
}

async function updateDocContent(req,res){
  const {docId} = req.params;
  const content = req.body.content;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try{
    const[result] = await db.query(
      `UPDATE docs SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?`,
      [content, docId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({ message: "Document saved" });
  } catch(err){
    console.error("Update content error:", err);
    return res.status(500).json({ error: "Update content error" });
  }
}

async function updateDocTitle(req, res){
  const {docId} = req.params;
  const {title} = req.body;
  const userId = req.user.id;

  try{
    const[result] = await db.query(
      `UPDATE docs SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?`,
      [title, docId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({ message: "Title Updated" });
  } catch(err){
    console.error("Update title  error:", err);
    return res.status(500).json({ error: "Failed to change title" });
  }
}

async function deleteDoc(req, res){
  const { docId } = req.params;
  const userId = req.user.id;

  try{
    const[result] = await db.query(
      "DELETE FROM docs WHERE id=? AND owner_id=?",[docId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.status(200).json({ message: "Document Deleted" }); 
  } catch(err){
    console.error("Delete doc error:", err);
    return res.status(500).json({ error: "Failed to delete document" });
  }
}

async function getAllDocs(req, res){
  const userId = req.user.id;
  try{
    const [rows] = await db.query("SELECT * FROM docs WHERE owner_id=? AND folder_id IS NULL ORDER BY updated_at DESC",[userId]);
    return res.status(200).json({docs: rows});
  }
  catch(err){
    console.error("All document fetching error:", err);
    return res.status(500).json({ error: "Failed to get documents" });
  }
}


async function getDocumentCount(req, res){
  const userId = req.user.id;
  try{
    const [rows] = await db.query("SELECT COUNT(*) as count FROM docs WHERE owner_id=?",[userId]);
    return res.status(200).json({count: rows[0].count});
  }
  catch(err){
    console.error("Document Count error", err);
    return res.status(500).json({ error: "Failed to get document count" });
  }
}

module.exports = {createNewDoc, getDocById, updateDocContent, updateDocTitle, deleteDoc, getAllDocs, getDocumentCount}