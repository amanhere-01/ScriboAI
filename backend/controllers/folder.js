const db = require("../services/db");


async function createNewFolder(req, res){
    const userId = req.user.id;
    const {name} = req.body;
    try{
			const[result] = await db.query(
				"INSERT INTO folders(owner_id, name) VALUES(?,?)", [userId, name]
			)

			return res.status(201).json({
				message : "New document created",
				folderId : result.insertId
			});
    } catch(err){
			console.error("Create folder error:", err);
			res.status(500).send("DB Error");
		}
}


async function getAllFolder(req, res){
	const userId = req.user.id;
	try{
		const [rows] = await db.query("SELECT * FROM folders WHERE owner_id=? ORDER BY name",[userId]);
		return res.status(200).json({folders: rows});
	}
	catch(err){
		console.error("All folder fetching error:", err);
		return res.status(500).json({ error: "DB error" });
	}
}


async function getAllDocsInFolder(req, res){
	const userId = req.user.id;
	const {folderId} = req.params;
	try{
		const[folderRows] = await db.query("SELECT * FROM folders WHERE id=? AND owner_id=? ",[folderId, userId]);
		if (folderRows.length === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

		const [docs] = await db.query("SELECT * FROM docs WHERE folder_id=? AND owner_id=? ORDER BY updated_at DESC ",[folderId, userId]);
		return res.status(200).json({
			folder: folderRows[0],
			docs
		});
	} catch (err) {
    console.error("Get docs in folder error:", err);
    return res.status(500).json({ error: "DB error" });
  }
	
}


module.exports = {createNewFolder, getAllFolder, getAllDocsInFolder}
