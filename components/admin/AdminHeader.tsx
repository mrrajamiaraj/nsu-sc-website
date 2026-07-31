import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-night-900/40 px-6 py-4">
      <p className="text-sm text-slate-400">
        Signed in as <span className="text-white">{email}</span>
      </p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </form>
    </header>
  );
}
