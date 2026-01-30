import { useState } from "react";
import { Menu, Plus, User, LogOut, FileText, MoreVertical, Trash2, ExternalLink, Folder, BadgePlus, CirclePlus } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { logoutSuccess } from "../store/authSlice";
import { useEffect } from "react";
import CreateFolder from "../components/CreateFolder";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [openDocMenuId, setOpenDocMenuId] = useState(null);
  const [openFolderMenuId, setOpenFolderMenuId] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/f`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to fetch folders");
          return;
        }

        setFolders(data.folders || []);
      } catch (err) {
        console.error("Fetch folders error:", err);
        toast.error("Failed to load folders");
      } finally {
        setFoldersLoading(false);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchDocs = async() => {
      try{
        const res = await fetch(`${BACKEND_URL}/docs`, {
          credentials: "include"
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to fetch documents");
          return;
        }
        
        setDocs(data.docs || []);

      } catch (err) {
        console.error("Fetch docs error:", err);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocs();
  }, [])

  
  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try{   
      const res = await fetch(`${BACKEND_URL}/auth/signout`, {
          method: 'POST',
          credentials: 'include'
      });
      
      const data = await res.json();

      if(!res.ok){
        toast.error(data.error || "Failed to log out");
        return;
      }
      
      toast.success(data.message || "Signed out successfully.");

    } catch(error){
      console.error("Sign out error:", error);
      toast.error("Network error while logging out");
    } finally {   //if backend fails to log out...user should be logged out either way
      dispatch(logoutSuccess());
      setShowMenu(false);
      setLoading(false);
      navigate('/auth')
    }
  };

  const handleCreateDoc = async() => {
    if (loading) return;
    setLoading(true);
    try{
      const res = await fetch(`${BACKEND_URL}/docs/create-doc`, {
        method: "POST",
        credentials: 'include'
      })

      const data = await res.json();

      if(!res.ok) {
        toast.error(data.error || "Failed to create document");
        return;
      }

      const docId = data.docId;
      navigate(`/doc/${docId}`);

    } catch(e){
      toast.error(e || "Failed to create document");
    } finally{
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm("Delete this document?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/docs/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete document");
        return;
      }

      setDocs((prev) => prev.filter((doc) => doc.id !== docId));
      toast.success("Document deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };
  
  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Delete this folder?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/f/${folderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete folder");
        return;
      }

      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      toast.success("Folder deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleCreateFolder = async(name) => {
    if (!name || !name.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try{
      const res = await fetch(`${BACKEND_URL}/f/create-folder`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name})
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create folder");
        return;
      }

      const folderId = data.folderId;
      navigate(`/f/${folderId}`);
      
    } catch (err) {
      toast.error("Failed to create folder");
    } finally{
      setShowFolderDialog(false);
      setShowCreateMenu(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ScriboAI
          </h1>

          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate("/profile")} 
              className="w-10 h-10 rounded-full cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md"
            >
              <User className="w-5 h-5 text-white" />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-gray-700 rotate-90" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to ScriboAI
          </h2>
          <p className="text-gray-600 text-lg">
            Your intelligent document workspace
          </p>
        </div>
              
        {/* Folders Grid */}
        {!foldersLoading && folders.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Folders
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition flex items-center gap-4"
                >
                  {/* 3-dot menu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenFolderMenuId(
                        openFolderMenuId === folder.id ? null : folder.id
                      );
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Dropdown */}
                  {openFolderMenuId === folder.id && (
                    <div className="absolute right-4 top-12 bg-white border rounded-lg shadow-lg z-50 w-44">
                      <button
                        onClick={() => window.open(`/f/${folder.id}`, "_blank")}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in new tab
                      </button>

                      <button
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-sm text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Card body */}
                  <div
                    onClick={() => navigate(`/f/${folder.id}`)}
                    className="cursor-pointer flex items-center gap-4"
                  >
                    <Folder className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold text-gray-800 truncate">
                        {folder.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Created on:{" "}
                        {new Date(folder.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

              ))}
            </div>
          </>
        )}

        {/* Documents Grid */}
        {!docsLoading && docs.length > 0 && (
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Documents
          </h3>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!docsLoading && docs.length > 0 &&
            docs.map((doc) => (
              <div
                key={doc.id}
                className="relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                {/* 3-dot menu */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDocMenuId(openDocMenuId === doc.id ? null : doc.id);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown */}
                {openDocMenuId === doc.id && (
                  <div className="absolute right-4 top-12 bg-white border rounded-lg shadow-lg z-50 w-44">
                    <button
                      onClick={() => window.open(`/doc/${doc.id}`, "_blank")}
                      className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in new tab
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-sm text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}

                {/* Card body */}
                <div
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-semibold text-gray-800 truncate">
                      {doc.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500">
                    Last updated:{" "}
                    {new Date(doc.updated_at).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
              </div>
            ))}

          {!docsLoading && docs.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-300 rounded-full mb-4">
                <Plus className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-500 text-lg">No documents yet</p>
              <p className="text-gray-400 mt-2">
                Click the + button to create your first document
              </p>
            </div>
          )}
        </div>
      </div>
      

      {/* Floating Create Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="group w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition"
        >
          <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {showCreateMenu && (
          <div className="absolute bottom-20 right-0 bg-white rounded-xl shadow-xl border w-48 overflow-hidden">
            <button
              onClick={() => {
                setShowCreateMenu(false);
                handleCreateDoc();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
            >
              <FileText className="w-5 h-5 text-red-600" />
              New Document
            </button>

            <button
              onClick={() => {
                setShowCreateMenu(false);
                setShowFolderDialog(true);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
            >
              <Folder className="w-5 h-5 text-yellow-500"/>
              Create Folder
            </button>
          </div>
        )}   
      </div>

      
      <CreateFolder
        isOpen={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
        onCreate={handleCreateFolder}
      />

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      {openFolderMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenFolderMenuId(null)}
        />
      )}

      {openDocMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDocMenuId(null)}
        />
      )}

      {showCreateMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCreateMenu(false)}
        />
      )}
    </div>
  );
}

