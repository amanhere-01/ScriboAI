import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Plus, ArrowLeft, Clock, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function FolderPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folder, setFolder] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/f/${folderId}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        setFolder(data.folder);
        setFolderName(data.folder.name);
        setDocs(data.docs || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFolderData();
  }, [folderId]);

  const handleCreateDoc = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/docs/create-doc`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      navigate(`/doc/${data.docId}`);
    } catch(err) {
      toast.error(err.message);
    }
  };

  const handleDeleteDoc = async (e, docId) => {
    e.stopPropagation(); 

    if (!confirm("Delete this document?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/docs/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setDocs((prev) => prev.filter((doc) => doc.id !== docId));
      toast.success(data.message);
    } catch(err) {
      toast.error(err.message);
    }
  };

  const saveFolderName = async () => {
    const trimmed = folderName.trim();

    if (!trimmed || trimmed === folder.name) {
      setFolderName(folder.name);
      setEditingName(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/f/${folderId}/title`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFolderName(folder.name);
        throw new Error(data.error);
      }

      setFolder((prev) => ({ ...prev, name: trimmed }));
      toast.success(data.message);
    } catch(err) {
      toast.error(err.message);
      setFolderName(folder.name);
    } finally {
      setEditingName(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <FolderOpen className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading folder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400 to-slate-300 rounded-xl shadow-lg">
                  <FolderOpen className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="flex flex-col">
                    {editingName ? (
                      <input
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onBlur={saveFolderName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveFolderName();
                          if (e.key === "Escape") {
                            setFolderName(folder.name);
                            setEditingName(false);
                          }
                        }}
                        className="text-2xl font-bold outline-none border-b-2 border-indigo-500 bg-transparent px-1 -ml-1 text-gray-800 w-fit"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditingName(true)}
                        className="text-2xl font-bold cursor-pointer hover:bg-gray-100 px-2 py-1 -ml-2 rounded-lg transition-colors text-gray-800 w-fit"
                      >
                        {folderName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateDoc}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-slate-400 text-black font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5 text-black group-hover:rotate-90 transition-transform duration-200" />
              New Document
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
          </div>

          {docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border-2 border-gray-200 hover:border-indigo-300 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                >
                  {/* Gradient accent on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-200"></div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => handleDeleteDoc(e, doc.id)}
                      className="absolute top-1 right-1 z-10 p-2 rounded-lg bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-200">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200 truncate">
                          {doc.title || 'Untitled Document'}
                        </h3>
                      </div>
                    </div>

                    {doc.updated_at && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(doc.updated_at).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first document
              </p>
              <button
                onClick={handleCreateDoc}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Create Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}