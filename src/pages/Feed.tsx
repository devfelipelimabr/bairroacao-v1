import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Asfalto/Buraco", "Iluminação", "Lixo/Entulho", "Poda/Árvores", "Segurança", "Água/Esgoto"];
const CAT_COLORS: Record<string, string> = {
  "Asfalto/Buraco": "bg-red-100 text-red-700",
  "Iluminação": "bg-amber-100 text-amber-700",
  "Lixo/Entulho": "bg-emerald-100 text-emerald-700",
  "Poda/Árvores": "bg-violet-100 text-violet-700",
  "Segurança": "bg-rose-100 text-rose-700",
  "Água/Esgoto": "bg-blue-100 text-blue-700",
};

const STATUS_COLORS: Record<string, string> = {
  "Aberto": "bg-neutral-100 text-neutral-600",
  "Confirmado": "bg-amber-100 text-amber-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Resolvido": "bg-emerald-100 text-emerald-700",
};

export default function Feed() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("Todos");
  const [sort, setSort] = useState<"relev" | "recentes">("relev");
  const [open, setOpen] = useState(false);
  const [createType, setCreateType] = useState<"issue" | "proposal" | "alert" | "service">("issue");

  const { data: myHoods } = trpc.neighborhood.myNeighborhoods.useQuery(undefined, { enabled: !!user });
  const hoodId = myHoods?.primary?.id ?? 1;

  const { data: posts, refetch } = trpc.post.list.useQuery({
    neighborhoodId: hoodId,
    filter,
    sort,
  });

  const { data: myConfirms } = trpc.post.myConfirms.useQuery(undefined, { enabled: !!user });
  const confirmMut = trpc.post.confirm.useMutation({ onSuccess: () => refetch() });
  const createMut = trpc.post.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    deadline: "3 dias",
    valid: "expira em 24h",
  });

  const handleCreate = () => {
    createMut.mutate({
      type: createType,
      category: createType === "alert" ? form.category : createType === "service" ? "Indicação" : form.category,
      title: form.title,
      description: form.description,
      neighborhoodId: hoodId,
      deadline: createType === "proposal" ? form.deadline : undefined,
      valid: createType === "alert" ? form.valid : undefined,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{myHoods?.primary?.name ?? "Feed"}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ Nova</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova publicação</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {(["issue", "proposal", "alert", "service"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCreateType(t)}
                  className={cn(
                    "border rounded-xl p-3 text-left text-sm transition-colors",
                    createType === t ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
                  )}
                >
                  <div className="font-medium">
                    {t === "issue" && "Problema"}
                    {t === "proposal" && "Proposta"}
                    {t === "alert" && "Alerta"}
                    {t === "service" && "Indicação"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t === "issue" && "Foto + pino no mapa"}
                    {t === "proposal" && "Votação com quórum"}
                    {t === "alert" && "Urgente 24–72h"}
                    {t === "service" && "Comércio local"}
                  </div>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {createType === "issue" && (
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {createType === "alert" && (
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Rua interditada", "Queda de energia", "Alagamento", "Pet perdido"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                placeholder="Título"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                placeholder="Descrição"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {createType === "proposal" && (
                <Select value={form.deadline} onValueChange={(v) => setForm({ ...form, deadline: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["3 dias", "5 dias", "7 dias"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {createType === "alert" && (
                <Select value={form.valid} onValueChange={(v) => setForm({ ...form, valid: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["expira em 24h", "expira em 48h", "expira em 72h"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={!form.title}>
              Publicar
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Todos", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors",
              filter === c
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-500 border-neutral-200"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="inline-flex border rounded-lg overflow-hidden text-xs">
          <button
            onClick={() => setSort("relev")}
            className={cn("px-3 py-1.5", sort === "relev" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500")}
          >
            Relevância
          </button>
          <button
            onClick={() => setSort("recentes")}
            className={cn("px-3 py-1.5", sort === "recentes" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500")}
          >
            Recentes
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {posts?.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="h-28 bg-neutral-100 relative flex items-center justify-center">
              <span className="text-3xl">
                {post.type === "alert" ? "⚠️" : post.type === "service" ? "🤝" : post.type === "proposal" ? "💡" : "📍"}
              </span>
              {post.blur && (
                <span className="absolute top-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                  ofuscado em 200m
                </span>
              )}
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                <Badge variant="secondary" className={cn("text-[10px]", CAT_COLORS[post.category] ?? "bg-neutral-100")}>
                  {post.category}
                </Badge>
                <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[post.status] ?? "bg-neutral-100")}>
                  {post.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="font-medium text-sm leading-snug">{post.title}</div>
              <p className="text-xs text-muted-foreground line-clamp-2">{post.description}</p>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>📍 a {post.dist}m</span>
                <span>·</span>
                <span>{post.coords}</span>
                <span>·</span>
                <span>💬 {post.comments}</span>
              </div>
              {post.type === "proposal" ? (
                <div className="text-xs space-y-1">
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (post.apoio / post.quorum) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{post.apoio}/{post.quorum} apoios</span>
                    <span>{post.deadline}</span>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  disabled={myConfirms?.includes(post.id)}
                  onClick={() => confirmMut.mutate({ postId: post.id })}
                >
                  {myConfirms?.includes(post.id) ? "✔ Confirmado por você" : "Confirmar problema"} · {post.confirms}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {posts?.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">
            Nenhuma publicação ainda.
          </div>
        )}
      </div>
    </div>
  );
}
