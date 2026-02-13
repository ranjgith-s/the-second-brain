"use client";

import { useState, useEffect } from "react";
import { saveEncrypted, getDecrypted } from "../utils/storage";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [activeProvider, setActiveProvider] = useState("openai");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedOpenaiKey = getDecrypted("openai_api_key");
    const savedGoogleKey = getDecrypted("google_api_key");
    const savedProvider = localStorage.getItem("active_provider"); // No need to encrypt simple config

    if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
    if (savedGoogleKey) setGoogleKey(savedGoogleKey);
    if (savedProvider) setActiveProvider(savedProvider);
  }, []);

  const handleSave = () => {
    if (openaiKey) saveEncrypted("openai_api_key", openaiKey);
    if (googleKey) saveEncrypted("google_api_key", googleKey);
    localStorage.setItem("active_provider", activeProvider);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active Provider
            </label>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value)}
              className="w-full p-2 border rounded-md text-gray-800"
            >
              <option value="openai">OpenAI (GPT-3.5)</option>
              <option value="google">Google (Gemini Pro)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 border rounded-md text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google API Key
            </label>
            <input
              type="password"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="AIza..."
              className="w-full p-2 border rounded-md text-gray-800"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
