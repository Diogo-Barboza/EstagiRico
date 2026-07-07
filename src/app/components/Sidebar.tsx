import { DollarSign } from "lucide-react";
import { NAV_TABS } from "../../lib/constants";
import type { View } from "../../lib/types";

export function Sidebar({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-[#EDEEF5] min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)" }}
          >
            <DollarSign size={15} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1E2D] leading-none">
              EstagiRico
            </p>
            <p className="text-[10px] text-[#9BA3AF] mt-0.5">
              Finanças pessoais
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 flex flex-col gap-0.5 flex-1">
        {NAV_TABS.map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
              style={{
                background: active ? "#6B5FD812" : "transparent",
                color: active ? "#6B5FD8" : "#9BA3AF",
              }}
            >
              <tab.icon size={17} />
              {tab.label === "Novo" ? "Registrar Gasto" : tab.label}
              {active && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "#6B5FD8" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
