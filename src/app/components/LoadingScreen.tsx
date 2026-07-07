import { DollarSign, Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div
      className="min-h-screen bg-[#F4F5F8] flex items-center justify-center"
      style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)",
            boxShadow: "0 4px 24px #6B5FD840",
          }}
        >
          <DollarSign size={24} color="white" strokeWidth={2.5} />
        </div>
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: "#6B5FD8" }}
        />
        <p className="text-sm text-[#9BA3AF] font-medium">Carregando...</p>
      </div>
    </div>
  );
}
