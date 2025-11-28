import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Construction } from "lucide-react";

export default function PerfilUsuario() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil do Usuário</h1>
          <p className="text-muted-foreground">Configure seu perfil e preferências</p>
        </div>

        {/* Em Desenvolvimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Configurações de Perfil
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e preferências do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Construction className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground max-w-md">
                Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
