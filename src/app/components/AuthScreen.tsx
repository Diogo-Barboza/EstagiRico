import { useState } from "react";
import { DollarSign, Mail, Lock, AlertCircle, Check, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuth();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
        );
      }
    } catch (err: any) {
      const msg = err?.message || "Ocorreu um erro inesperado.";
      if (msg.includes("Invalid login credentials"))
        setError("E-mail ou senha inválidos.");
      else if (msg.includes("User already registered"))
        setError("Este e-mail já está cadastrado.");
      else if (msg.includes("Password should be at least"))
        setError("A senha deve ter no mínimo 6 caracteres.");
      else if (msg.includes("Unable to validate email"))
        setError("E-mail inválido.");
      else if (msg.includes("Email not confirmed"))
        setError("Confirme seu e-mail antes de entrar.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F4F5F8] flex items-center justify-center px-4"
      style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)",
              boxShadow: "0 8px 32px #6B5FD840",
            }}
          >
            <DollarSign size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1E2D]">EstagiRico</h1>
          <p className="text-sm text-[#9BA3AF] mt-1">
            Gestão de finanças pessoais
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EDEEF5] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1A1E2D] mb-1">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h2>
          <p className="text-xs text-[#9BA3AF] mb-6">
            {isLogin
              ? "Acesse sua conta para gerenciar suas finanças"
              : "Crie sua conta para começar a controlar seus gastos"}
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FCEAEA] border border-[#D85F5F]/20 mb-4">
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: "#D85F5F" }}
              />
              <p className="text-xs text-[#D85F5F]">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#E8F7EF] border border-[#3D9E6E]/20 mb-4">
              <Check
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: "#3D9E6E" }}
              />
              <p className="text-xs text-[#3D9E6E]">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA3AF] pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F5F8] text-sm text-[#1A1E2D] placeholder:text-[#C8CADB] outline-none focus:ring-2 focus:ring-[#6B5FD820] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA3AF] pointer-events-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F5F8] text-sm text-[#1A1E2D] placeholder:text-[#C8CADB] outline-none focus:ring-2 focus:ring-[#6B5FD820] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)",
                boxShadow: "0 4px 20px #6B5FD840",
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? "Entrar" : "Criar Conta"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#F4F5F8] text-center">
            <button
              onClick={() => {
                setIsLogin((l) => !l);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-sm text-[#9BA3AF] hover:text-[#6B5FD8] transition-colors"
            >
              {isLogin ? (
                <>
                  Não tem conta?{" "}
                  <span className="font-semibold text-[#6B5FD8]">
                    Criar conta
                  </span>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <span className="font-semibold text-[#6B5FD8]">Entrar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
