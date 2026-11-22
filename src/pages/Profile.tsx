import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myHoods } = trpc.neighborhood.myNeighborhoods.useQuery(undefined, { enabled: !!user });

  const handleLogout = () => {
    fetch("/api/oauth/logout", { method: "POST", credentials: "include" }).then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center space-y-2 py-4">
        <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
          {user?.name?.charAt(0) ?? "U"}
        </div>
        <div className="font-medium">{user?.name ?? "Morador"}</div>
        <div className="text-xs text-muted-foreground">{user?.email ?? ""}</div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Reputação cívica</span>
            <span className="font-medium">{user?.reputationScore ?? 0} pts</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, ((user?.reputationScore ?? 0) / 50) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            0 – 49: vizinho · 50 – 199: ativista · 200+: embaixador
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-medium text-sm">Bairro</h2>
          {myHoods?.primary ? (
            <div className="flex justify-between text-sm">
              <span>{myHoods.primary.name}</span>
              <span className="text-xs text-muted-foreground">{myHoods.primary.city}, {myHoods.primary.state}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum bairro selecionado</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-medium text-sm">Privacidade</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Perfil: apenas moradores do bairro</p>
            <p>• Dados: não vendidos, não publicados</p>
            <p>• GPS: 200m de precisão, não exato</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => navigate("/onboarding")}>
          Trocar bairro
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  );
}
