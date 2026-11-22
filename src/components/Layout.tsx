import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/feed", label: "Feed", icon: "▤" },
  { path: "/map", label: "Mapa", icon: "◎" },
  { path: "/decisions", label: "Decisões", icon: "✓" },
  { path: "/profile", label: "Perfil", icon: "👤" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative">
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>
        <nav className="absolute bottom-0 left-0 right-0 border-t bg-white flex items-center justify-around py-2 z-50">
          {tabs.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className={cn(
                "flex flex-col items-center gap-0.5 text-xs px-4 py-1 rounded-lg transition-colors",
                location.pathname === t.path
                  ? "text-neutral-900 font-medium"
                  : "text-neutral-400"
              )}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
