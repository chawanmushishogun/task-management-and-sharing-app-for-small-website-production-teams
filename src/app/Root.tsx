import App from "./App";
import { LoginView } from "./components/LoginView";
import { useAuth } from "./hooks/useAuth";

/** ログイン状態で S0（ログイン）と S1〜S5（App）を切り替える */
export function Root() {
  const { session, loading, signIn, signOut } = useAuth();
  if (loading) return null;
  if (!session) return <LoginView onSignIn={signIn} />;
  return <App onSignOut={signOut} />;
}
