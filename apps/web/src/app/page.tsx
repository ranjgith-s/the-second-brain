"use client";

import { useState, useEffect } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-100 text-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center w-full mb-8">The Second Brain</h1>
      </div>

      <div className="flex-1 w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
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

        <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
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
              {isLoading ? "Saving..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
