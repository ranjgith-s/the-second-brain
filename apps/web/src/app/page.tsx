"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Rocket, Settings, MessageSquare, StickyNote } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import { getDecrypted } from "@/utils/storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Note {
  id: string;
  content: string;
  category: string;
  created_at: string;
}

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
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                The Second Brain
              </span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <Rocket className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Fast Performance
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Built with the latest tech stack for speed.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Secure
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Top-notch security practices.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              Scalable
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Grows with your business needs.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle>Navigation</CardTitle>
               </CardHeader>
               <CardContent className="grid gap-2">
                 <Button
                    variant={activeTab === "notes" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("notes")}
                  >
                    <StickyNote className="mr-2 h-4 w-4" />
                    Notes
                 </Button>
                 <Button
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                 </Button>
               </CardContent>
             </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>{activeTab === "notes" ? "My Notes" : "AI Assistant"}</CardTitle>
                <CardDescription>
                  {activeTab === "notes" ? "Capture your thoughts and ideas." : "Chat with your second brain."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                 {activeTab === "notes" ? (
                    <div className="space-y-4">
                      {notes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">No notes yet. Start typing!</p>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="rounded-lg border p-4 bg-muted/50">
                            <p className="text-sm">{note.content}</p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                 ) : (
                    <div className="space-y-4">
                      {chatMessages.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">Start a conversation...</p>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                 )}
              </CardContent>
              <CardFooter className="pt-4 border-t">
                {activeTab === "notes" ? (
                  <form onSubmit={handleNoteSubmit} className="flex w-full gap-2">
                    <Input
                      placeholder="Type a note..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleChatSubmit} className="flex w-full gap-2">
                    <Input
                      placeholder="Ask something..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isChatLoading}
                    />
                    <Button type="submit" disabled={isChatLoading}>
                      {isChatLoading ? "..." : "Send"}
                    </Button>
                  </form>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
