"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed || value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-wrap gap-2">
      
      {/* Existing Tags */}
      {value.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs"
        >
          {tag}
          <button onClick={() => removeTag(tag)}>
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Type feature and press Enter"
        className="bg-transparent outline-none text-white text-sm flex-1 min-w-[120px]"
      />
    </div>
  );
}