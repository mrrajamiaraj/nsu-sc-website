import { LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function AdminHeader({
  email,
  menuOpen,
  onMenuClick,
}: {
  email: string;
  menuOpen: boolean;
  onMenuClick: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-night-900/40 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open dashboard menu"
          aria-expanded={menuOpen}
          aria-controls="admin-menu"
          className="rounded-full p-2 text-slate-300 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="truncate text-sm text-slate-400">
          Signed in as <span className="text-white">{email}</span>
        </p>
      </div>
      <form action={logoutAction} className="shrink-0">
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
