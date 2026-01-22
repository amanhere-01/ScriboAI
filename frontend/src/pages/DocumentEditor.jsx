import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Bold,Italic,Undo, Redo,AlignLeft,AlignCenter,AlignRight,List,ListOrdered,FileText } from "lucide-react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DocumentEditor() {
  const { docId } = useParams();
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // FETCH DOCUMENT
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/doc/${docId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setDoc(data.doc);
        setTitle(data.doc.title);
      } catch (err) {
        toast.error(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [docId]);

  // TIPTAP EDITOR
  const editor = useEditor({
    extensions: [StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    onUpdate({ editor }) {
      setDoc(prev => ({
        ...prev,
        content: JSON.stringify(editor.getJSON()),
      }));
    },
  });

  useEffect(() => {
    if (!editor || !doc?.content || contentLoaded) return;

    editor.commands.setContent(JSON.parse(doc.content), false);
    setContentLoaded(true);
  }, [editor, doc?.content, contentLoaded]);

  // AUTOSAVE
  useEffect(() => {
    if (!doc?.content || loading) return;

    setIsSaving(true);
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        await fetch(`${BACKEND_URL}/doc/${docId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: doc.content }),
        });
      } catch {
        toast.error("Autosave failed");
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [doc?.content, docId, loading]);


  // SAVE TITLE
  const saveTitle = async () => {
    setEditingTitle(false);
    if (title === doc.title) return;

    try {
      await fetch(`${BACKEND_URL}/doc/${docId}/title`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      setDoc(prev => ({ ...prev, title }));
    } catch {
      toast.error("Failed to save title");
    }
  };

	// UI Functions
	const ToolBtn = ({ children, onClick, active }) => (
		<button
			onClick={onClick}
			className={`p-2 rounded hover:bg-gray-100 ${
				active ? "bg-gray-200" : ""
			}`}
		>
			{children}
		</button>
	);

	const Divider = () => (
		<div className="w-px h-6 bg-gray-300 mx-1" />
	);

  if (loading) return <p className="p-6">Loading document...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ================= TOP BAR ================= */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg shadow-lg shadow-purple-500/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex flex-col">
            {editingTitle ? (
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => e.key === "Enter" && saveTitle()}
                className="text-lg font-semibold outline-none border-b-2 border-purple-500 bg-transparent px-1 -ml-1 text-gray-800"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                className="text-lg font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 -ml-2 rounded-lg transition-colors text-gray-800"
              >
                {title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
            {isSaving ? (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Saving...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 font-medium">Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= TOOLBAR ================= */}
      {editor && (
        <div className="sticky top-14 bg-white border-b z-10">
          <div className="flex gap-1 px-4 py-2 justify-center">
            <ToolBtn onClick={() => editor.chain().focus().undo().run()}>
              <Undo size={16} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()}>
              <Redo size={16} />
            </ToolBtn>

            <Divider />

            <ToolBtn
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold size={16} />
            </ToolBtn>
            <ToolBtn
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic size={16} />
            </ToolBtn>

            <Divider />

            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <AlignLeft size={16} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <AlignCenter size={16} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <AlignRight size={16} />
            </ToolBtn>

            <Divider />

            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List size={16} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered size={16} />
            </ToolBtn>
          </div>
        </div>
      )}

      {/* ================= EDITOR PAGE ================= */}
      <div className="pt-28 pb-20 min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white shadow px-20 py-14 min-h-[calc(100vh-7rem)]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}


