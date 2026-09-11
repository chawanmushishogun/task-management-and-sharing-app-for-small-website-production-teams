import { useState } from "react";
import { Zap } from "lucide-react";

/** S0 ログイン画面。チーム共有アカウントのメールとパスワードを入れる */
export function LoginView({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || submitting) return;
    setSubmitting(true);
    setError(null);
    const message = await onSignIn(email.trim(), password);
    if (message) setError("メールアドレスまたはパスワードが違います");
    setSubmitting(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4"
      style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
    >
      <form onSubmit={submit} className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
            <Zap size={18} />
          </div>
          <div>
            <h1 className="text-[17px] font-medium text-foreground leading-tight">Web制作タスク共有ボード</h1>
            <p className="text-[12px] text-muted-foreground">チーム共有アカウントでログイン</p>
          </div>
        </div>

        <label className="block text-[13px] text-muted-foreground mb-1">メールアドレス</label>
        <input
          type="email"
          autoComplete="username"
          autoFocus
          className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-[13px] text-muted-foreground mb-1">パスワード</label>
        <input
          type="password"
          autoComplete="current-password"
          className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-[13px] text-destructive mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="w-full text-[14px] px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "ログイン中…" : "ログイン"}
        </button>
      </form>
    </div>
  );
}
