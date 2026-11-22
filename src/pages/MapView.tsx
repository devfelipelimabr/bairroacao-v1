import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CAT_COLORS: Record<string, string> = {
  "Asfalto/Buraco": "#b91c1c",
  "Iluminação": "#b45309",
  "Lixo/Entulho": "#0f7b5f",
  "Poda/Árvores": "#7c3aed",
  "Segurança": "#be123c",
  "Água/Esgoto": "#1d4ed8",
  "Alerta": "#b45309",
  "Indicação": "#0f7b5f",
  "Melhoria": "#1d4ed8",
};

const STATUS_COLORS: Record<string, string> = {
  "Aberto": "bg-neutral-100 text-neutral-600",
  "Confirmado": "bg-amber-100 text-amber-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Resolvido": "bg-emerald-100 text-emerald-700",
};

export default function MapView() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const { data: myHoods } = trpc.neighborhood.myNeighborhoods.useQuery(undefined, { enabled: !!user });
  const hoodId = myHoods?.primary?.id ?? 1;
  const { data: posts } = trpc.post.list.useQuery({ neighborhoodId: hoodId });
  const { data: myConfirms } = trpc.post.myConfirms.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();
  const confirmMut = trpc.post.confirm.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
    },
  });

  const selectedPost = posts?.find((p) => p.id === selected);

  return (
    <div className="p-4 space-y-3 h-full flex flex-col">
      <h1 className="text-lg font-semibold">Mapa do bairro</h1>
      <Card className="flex-1 overflow-hidden relative">
        <svg viewBox="0 0 360 300" className="w-full h-full">
          <rect width="360" height="300" fill="#fafafa" />
          <polygon points="16,22 344,16 352,286 20,292" fill="none" stroke="#9ca3af" strokeDasharray="6 5" />
          <rect x="34" y="36" width="120" height="88" rx="4" fill="#e8f5ef" />
          <text x="44" y="52" fontSize="10" fill="#6b7280">Praça do Coreto</text>
          <g stroke="#e5e7eb" strokeWidth="6">
            <line x1="30" y1="140" x2="330" y2="132" />
            <line x1="40" y1="210" x2="320" y2="222" />
            <line x1="120" y1="30" x2="112" y2="290" />
            <line x1="250" y1="24" x2="242" y2="288" />
            <line x1="180" y1="150" x2="300" y2="146" />
          </g>
          <circle cx="168" cy="176" r="7" fill="#14181b" />
          <text x="180" y="180" fontSize="10" fill="#14181b">Você</text>
          {posts?.map((p) => (
            <g key={p.id} className="cursor-pointer" onClick={() => setSelected(p.id)}>
              <circle cx={p.x} cy={p.y} r="12" fill={CAT_COLORS[p.category] ?? "#6b7280"} stroke="#fff" strokeWidth="2" />
              <text x={p.x} y={(p.y ?? 0) + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
                {p.confirms}
              </text>
            </g>
          ))}
        </svg>
      </Card>

      {selectedPost && (
        <Card className="p-3 space-y-2 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <Badge variant="secondary" className="text-[10px]">{selectedPost.category}</Badge>
              <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[selectedPost.status])}>
                {selectedPost.status}
              </Badge>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground">✕</button>
          </div>
          <div className="font-medium text-sm">{selectedPost.title}</div>
          <p className="text-xs text-muted-foreground">{selectedPost.description}</p>
          <div className="text-[11px] text-muted-foreground">
            📍 a {selectedPost.dist}m · {selectedPost.coords}
          </div>
          {selectedPost.type !== "proposal" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              disabled={myConfirms?.includes(selectedPost.id)}
              onClick={() => confirmMut.mutate({ postId: selectedPost.id })}
            >
              {myConfirms?.includes(selectedPost.id) ? "✔ Confirmado" : "Confirmar problema"} · {selectedPost.confirms}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
