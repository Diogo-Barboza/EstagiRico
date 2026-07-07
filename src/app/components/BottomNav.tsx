import { Plus } from "lucide-react";
import { NAV_TABS } from "../../lib/constants";
import type { View } from "../../lib/types";

export function BottomNav({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[#EDEEF5] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-[60px]">
        {NAV_TABS.map((tab) => {
          const active = view === tab.id;
          const isAdd = tab.id === "add";
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative"
              style={{ color: active ? "#6B5FD8" : "#C8CADB" }}
            >
              {isAdd ? (
                <div
                  className="w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90"
                  style={{
                    background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)",
                    boxShadow: "0 4px 20px #6B5FD850",
                  }}
                >
                  <Plus size={22} color="white" />
                </div>
              ) : (
                <>
                  <tab.icon size={20} />
                  <span className="text-[9px] font-semibold">{tab.label}</span>
                  {active && (
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: "#6B5FD8" }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
