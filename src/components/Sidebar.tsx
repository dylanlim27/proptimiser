import Link from "next/link";
import { Home, Users, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-background shadow-[1px_0_10px_rgba(0,0,0,0.01)]">
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5 mb-2 hover:opacity-80 transition-opacity">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            P
          </div>
          <h2 className="text-base font-bold tracking-tight">Proptimiser</h2>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/leads"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
        >
          <Users className="h-4 w-4" />
          Leads
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </div>
  );
}
