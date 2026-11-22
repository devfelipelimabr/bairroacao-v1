import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CAT_COLORS: Record<string, string> = {
  "Asfalto/Buraco": "bg-red-100 text-red-700",
  "Iluminação": "bg-amber-100 text-amber-700",
  "Lixo/Entulho": "bg-emerald-100 text-emerald-700",
  "Poda/Árvores": "bg-violet-100 text-violet-700",
  "Segurança": "bg-rose-100 text-rose-700",
  "Água/Esgoto": "bg-blue-100 text-blue-700",
};

export default function Decisions() {
  const { user } = useAuth();
  const { data: myHoods } = trpc.neighborhood.myNeighborhoods.useQuery(undefined, { enabled: !!user });
  const hoodId = myHoods?.primary?.id ?? 1;

  const { data: proposals, refetch: refetchProposals } = trpc.proposal.list.useQuery({ neighborhoodId: hoodId });
  const { data: ranking } = trpc.proposal.ranking.useQuery({ neighborhoodId: hoodId });
  const { data: myVotes } = trpc.proposal.myVotes.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();
  const voteMut = trpc.proposal.vote.useMutation({
    onSuccess: () => {
      refetchProposals();
      utils.proposal.myVotes.invalidate();
    },
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Decisões do bairro</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-sm">Enquetes ativas</h2>
            <span className="text-xs text-muted-foreground">quórum de 30 apoios</span>
          </div>
          {proposals?.map((p) => {
            const my = myVotes?.[p.id];
            return (
              <div key={p.id} className="border-t pt-3 space-y-2">
                <div className="font-medium text-sm">{p.title}</div>
                <p className="text-xs text-muted-foreground">{p.description}</p>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (p.apoio / p.quorum) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{p.apoio}/{p.quorum} apoios · {p.contra} contras</span>
                  <span>{p.deadline}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("flex-1 text-xs", my === "apoio" && "border-blue-500 bg-blue-50")}
                    disabled={my === "apoio"}
                    onClick={() => voteMut.mutate({ postId: p.id, side: "apoio" })}
                  >
                    👍 {my === "apoio" ? "Apoiado" : "Apoio"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("flex-1 text-xs", my === "contra" && "border-red-500 bg-red-50")}
                    disabled={my === "contra"}
                    onClick={() => voteMut.mutate({ postId: p.id, side: "contra" })}
                  >
                    👎 {my === "contra" ? "Não apoiado" : "Não apoio"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-medium text-sm">Ranking de prioridades do mês</h2>
          {ranking?.map((p, i) => (
            <div key={p.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{i + 1}. {p.title}</span>
                <span className="text-xs text-muted-foreground">{p.confirms} apoios</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, p.confirms * 3)}%`,
                    backgroundColor: CAT_COLORS[p.category]?.includes("red")
                      ? "#b91c1c"
                      : CAT_COLORS[p.category]?.includes("amber")
                      ? "#b45309"
                      : CAT_COLORS[p.category]?.includes("emerald")
                      ? "#0f7b5f"
                      : CAT_COLORS[p.category]?.includes("violet")
                      ? "#7c3aed"
                      : CAT_COLORS[p.category]?.includes("blue")
                      ? "#1d4ed8"
                      : "#6b7280",
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-medium text-sm">Melhorias conquistadas</h2>
          <div className="flex gap-3">
            <div className="flex-1 h-14 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-lg">
              ⚠️
            </div>
            <div className="flex-1 h-14 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">
              ✓
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Poda concluída na Rua das Hortênsias — resolvido em 9 dias com 19 confirmações.
          </p>
        </CardContent>
      </Card>

      <Button className="w-full" variant="default" asChild>
        <a href={`/dossie?neighborhoodId=${hoodId}`} target="_blank" rel="noopener noreferrer">
          📄 Gerar dossiê cívico do mês
        </a>
      </Button>
    </div>
  );
}
