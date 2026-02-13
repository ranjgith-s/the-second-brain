"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import SettingsModal from "../components/SettingsModal";
import { getDecrypted } from "../utils/storage";

interface Note {
  id: string;
  content: string;
  category: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/notes/`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          category: "general",
        }),
      });

      if (res.ok) {
        setInput("");
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const provider = localStorage.getItem("active_provider") || "openai";
    const apiKey = getDecrypted(provider === "google" ? "google_api_key" : "openai_api_key");

    if (!apiKey) {
      alert("Please set your API key in settings first.");
      setIsSettingsOpen(true);
      return;
    }

    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          provider,
          api_key: apiKey
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        const error = await res.json();
        setChatMessages(prev => [...prev, { role: "system", content: `Error: ${error.detail || "Failed to get response"}` }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: "system", content: "Error connecting to server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100 text-black">
      <div className="z-10 max-w-5xl w-full flex items-center justify-between font-mono text-sm mb-8">
        <h1 className="text-4xl font-bold">The Second Brain</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === "notes" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === "chat" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          Chat
        </button>
      </div>

      <div className="flex-1 w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-[600px]">
        {activeTab === "notes" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800">{note.content}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-center text-gray-400 mt-10">No notes yet. Start typing!</p>
              )}
            </div>

            <form onSubmit={handleNoteSubmit} className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a note..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-lg max-w-[80%] ${msg.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"}`}>
                  <p className="text-xs font-semibold mb-1 text-gray-500 capitalize">{msg.role}</p>
                  <p className="text-gray-800 whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-center text-gray-400 mt-10">Start a conversation...</p>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isChatLoading ? "..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </main>
  );
}
