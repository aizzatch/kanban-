import { useState, useRef } from "react";
import { TAG_COLORS, COLOR_KEYS, DEFAULT_COLOR, encodeTag, decodeTag } from "./tagUtils";
import type { ColorKey } from "./tagUtils";

const MAX_TAGS = 5;
const MAX_GLOBAL_TAGS = 50;

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  allTags?: string[];
};

export default function TagInput({ tags, onChange, allTags = [] }: Props) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorKey>(DEFAULT_COLOR);
  const [colorOpen, setColorOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = input.trim();

  const globalUniqueNames = new Set(allTags.map((t) => decodeTag(t).name));
  const atGlobalLimit = globalUniqueNames.size >= MAX_GLOBAL_TAGS;
  const currentNames = new Set(tags.map((t) => decodeTag(t).name));

  const seenNames = new Set<string>();
  const suggestions = trimmed
    ? allTags.filter((t) => {
        const { name } = decodeTag(t);
        if (!name.toLowerCase().includes(trimmed.toLowerCase())) return false;
        if (currentNames.has(name)) return false;
        if (seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      })
    : [];

  const isNewName = trimmed !== "" && !globalUniqueNames.has(trimmed);
  const overCharLimit = trimmed.length > 25;
  const canAdd = trimmed !== "" && !currentNames.has(trimmed) && tags.length < MAX_TAGS && !(isNewName && atGlobalLimit) && !overCharLimit;

  const addEncoded = (encoded: string) => {
    const { name } = decodeTag(encoded);
    if (tags.length >= MAX_TAGS || currentNames.has(name)) return;
    onChange([...tags, encoded]);
    setInput("");
  };

  const addNew = () => {
    if (!canAdd) { setInput(""); return; }
    const existing = allTags.find((t) => decodeTag(t).name === trimmed);
    addEncoded(existing ?? encodeTag(trimmed, selectedColor));
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNew();
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    setColorOpen(false);
  };

  const sc = TAG_COLORS[selectedColor];
  const showSuggestions = focused && trimmed.length > 0 && suggestions.length > 0;

  return (
    <div>
      {/* Chips */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
          {tags.map((encoded, i) => {
            const { name, color } = decodeTag(encoded);
            const c = TAG_COLORS[color];
            return (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: c.bg,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  borderRadius: "12px",
                  padding: "1px 8px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {name}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: c.text, fontSize: "0.75rem" }}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Input row + dropdowns */}
      {tags.length < MAX_TAGS && (
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              overflow: "visible",
            }}
          >
            {/* Color picker button */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                type="button"
                title="Pick color"
                onMouseDown={(e) => { e.preventDefault(); setColorOpen((v) => !v); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "0 10px",
                  height: "36px",
                  background: "none",
                  border: "none",
                  borderRight: "1px solid #e2e8f0",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "14px",
                    borderRadius: "3px",
                    background: sc.text,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.6rem", color: "#94a3b8", lineHeight: 1 }}>▾</span>
              </button>

              {/* Vertical color dropdown */}
              {colorOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 2px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    zIndex: 30,
                    overflow: "hidden",
                  }}
                >
                  {COLOR_KEYS.map((key) => {
                    const c = TAG_COLORS[key];
                    const isSelected = selectedColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedColor(key);
                          setColorOpen(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "20px",
                          background: c.text,
                          border: "none",
                          borderBottom: "1px solid rgba(255,255,255,0.15)",
                          outline: isSelected ? "2px solid #0f172a" : "none",
                          outlineOffset: "-2px",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Text input */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={handleBlur}
              placeholder="Tag name…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.875rem",
                padding: "0 10px",
                height: "36px",
                background: "transparent",
                minWidth: 0,
              }}
            />

            {/* + button */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addNew(); }}
              disabled={!canAdd}
              style={{
                height: "36px",
                padding: "0 12px",
                background: canAdd ? "#6366f1" : "#e2e8f0",
                color: canAdd ? "#fff" : "#94a3b8",
                border: "none",
                borderLeft: "1px solid #e2e8f0",
                borderRadius: "0 6px 6px 0",
                cursor: canAdd ? "pointer" : "not-allowed",
                fontSize: "1rem",
                fontWeight: 600,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 2px)",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 20,
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {suggestions.map((encoded, i) => {
                const { name, color } = decodeTag(encoded);
                const c = TAG_COLORS[color];
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addEncoded(encoded); }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "7px 12px",
                      background: "none",
                      border: "none",
                      borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "1px 8px", fontSize: "0.75rem", fontWeight: 500 }}>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
        {tags.length}/{MAX_TAGS} tags
      </p>
    </div>
  );
}
