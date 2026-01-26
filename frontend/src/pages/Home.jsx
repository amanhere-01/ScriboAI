import { useState } from "react";
import { Menu, Plus, User, LogOut, FileText, MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { logoutSuccess } from "../store/authSlice";
import { useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

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

        {/* Documents Grid */}
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
                    setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown */}
                {openMenuId === doc.id && (
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
      <button
        onClick={handleCreateDoc}
        disabled={loading}
        className="group fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-200" />
      </button>


      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}

