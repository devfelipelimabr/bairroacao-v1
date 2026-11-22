import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: neighborhoods } = trpc.neighborhood.list.useQuery();
  const { data: myHoods } = trpc.neighborhood.myNeighborhoods.useQuery(undefined, {
    enabled: !!user,
  });
  const utils = trpc.useUtils();
  const setPrimary = trpc.neighborhood.setPrimary.useMutation({
    onSuccess: () => {
      utils.neighborhood.myNeighborhoods.invalidate();
      navigate("/feed");
    },
  });

  useEffect(() => {
    if (myHoods?.primary) {
      navigate("/feed");
    }
  }, [myHoods, navigate]);

  const active = neighborhoods?.filter((n) => n.active) ?? [];
  const inactive = neighborhoods?.filter((n) => !n.active) ?? [];

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-8 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Escolha seu bairro</h1>
        <p className="text-muted-foreground text-sm">
          Encontramos sua comunidade pelo GPS. Confirme onde você mora.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Bairros ativos
        </h2>
        {active.map((n) => (
          <Card key={n.id} className="cursor-pointer hover:border-neutral-900 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{n.name}</div>
                <div className="text-xs text-muted-foreground">
                  {n.city}, {n.state} · {n.usersCount} moradores
                </div>
              </div>
              <Button size="sm" onClick={() => setPrimary.mutate({ neighborhoodId: n.id })}>
                Selecionar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {inactive.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Lista de espera
          </h2>
          {inactive.map((n) => (
            <Card key={n.id} className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{n.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.city}, {n.state}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-700">
                    {n.usersCount}/{n.minUsers}
                  </span>
                </div>
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(n.usersCount / n.minUsers) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Faltam {n.minUsers - n.usersCount} moradores para ativar
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
