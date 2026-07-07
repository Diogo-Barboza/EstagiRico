import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Generic dropdown — renders the options list as a fixed-position overlay
 * so it's never clipped by parent overflow:hidden containers.
 */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  renderOption,
  placeholder = "Selecione…",
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  renderOption?: (v: T) => React.ReactNode;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Calculate fixed position each time the dropdown opens
  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#F0F1F7] text-sm font-medium text-[#1A1E2D] text-left transition-colors hover:bg-[#E8E9F2] focus:outline-none focus:ring-2 focus:ring-[#6B5FD820]"
      >
        <span>{renderOption ? renderOption(value) : value || placeholder}</span>
        <ChevronDown
          size={15}
          className="text-[#9BA3AF] shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          style={dropdownStyle}
          className="bg-white rounded-xl shadow-xl border border-[#E8E9F2] overflow-hidden max-h-52 overflow-y-auto"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#F4F5F8] transition-colors text-left"
            >
              <span className="text-[#1A1E2D]">
                {renderOption ? renderOption(opt) : opt}
              </span>
              {value === opt && (
                <Check size={14} style={{ color: "#6B5FD8" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
