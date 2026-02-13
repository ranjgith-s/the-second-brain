"use client";

import { useState, useEffect } from "react";
import { saveEncrypted, getDecrypted } from "../utils/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [activeProvider, setActiveProvider] = useState("openai");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) return;

    const loadSettings = () => {
      try {
        const savedOpenaiKey = getDecrypted("openai_api_key");
        const savedGoogleKey = getDecrypted("google_api_key");
        const savedProvider = localStorage.getItem("active_provider");

        if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
        if (savedGoogleKey) setGoogleKey(savedGoogleKey);
        if (savedProvider) setActiveProvider(savedProvider);
        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (openaiKey) saveEncrypted("openai_api_key", openaiKey);
    if (googleKey) saveEncrypted("google_api_key", googleKey);
    localStorage.setItem("active_provider", activeProvider);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Active Provider
            </Label>
            <div className="col-span-3">
              <Select
                value={activeProvider}
                onValueChange={setActiveProvider}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-3.5)</SelectItem>
                  <SelectItem value="google">Google (Gemini Pro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="openai" className="text-right">
              OpenAI Key
            </Label>
            <Input
              id="openai"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="google" className="text-right">
              Google Key
            </Label>
            <Input
              id="google"
              type="password"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="AIza..."
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            {isSaved ? "Saved!" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
