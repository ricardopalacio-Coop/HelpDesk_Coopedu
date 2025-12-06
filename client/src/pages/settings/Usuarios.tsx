import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/Layout";
import { trpc, RouterOutputs } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, UserRound, Eye, Edit2, Trash2 } from "lucide-react";

const userFormSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(3, "Informe o nome completo"),
  nickname: z.string().min(2).optional().nullable(),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .regex(/^\+55\d{10,11}$/, "Use o formato +5511999999999")
    .optional()
    .nullable(),
  departmentId: z.number().optional().nullable(),
  profileTypeId: z.number(),
  avatar: z.string().optional().nullable(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type UserItem = RouterOutputs["users"]["list"]["items"][number];

function formatPhone(phone?: string | null) {
  if (!phone) return "-";
  return phone.replace(/(\+55)(\d{2})(\d{4,5})(\d{4})/, "+55 ($2) $3-$4");
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Usuarios() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>();
  const [profileFilter, setProfileFilter] = useState<number | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewUser, setViewUser] = useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const getFriendlyErrorMessage = (message?: string) => {
    if (!message) return "Ocorreu um erro. Tente novamente.";
    const map: Record<string, string> = {
      EMAIL_IN_USE: "Já existe um usuário com esse e-mail.",
      PROFILE_TYPE_NOT_FOUND: "Perfil de acesso não encontrado.",
      SUPABASE_SYNC_FAILED: "Não foi possível sincronizar com o Supabase. Tente novamente.",
    };
    return map[message] ?? message;
  };

  const pageSize = 10;
  const filters = useMemo(
    () => ({
      page,
      pageSize,
      search: searchTerm || undefined,
      departmentId: departmentFilter,
      profileTypeId: profileFilter,
    }),
    [page, pageSize, searchTerm, departmentFilter, profileFilter]
  );

  const usersQuery = trpc.users.list.useQuery(filters);
  const profileTypesQuery = trpc.users.profileTypes.useQuery();
  const departmentsQuery = trpc.departments.list.useQuery();

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Novo usuário criado com sucesso",
        description: "O convite foi enviado para o e-mail informado.",
      });
      usersQuery.refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar usuário",
        description: getFriendlyErrorMessage(error.message),
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Usuário atualizado com sucesso",
        description: "As informações foram sincronizadas.",
      });
      usersQuery.refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: getFriendlyErrorMessage(error.message),
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Usuário removido com sucesso",
      });
      usersQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: getFriendlyErrorMessage(error.message),
        variant: "destructive",
      });
    },
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      nickname: "",
      email: "",
      phone: "+55",
      departmentId: undefined,
      profileTypeId: undefined,
      avatar: null,
    },
  });

  const resetForm = useCallback(
    (user?: UserItem | null) => {
      const defaultProfile = profileTypesQuery.data?.[0]?.id;
      if (!user) {
        form.reset({
          fullName: "",
          nickname: "",
          email: "",
          phone: "+55",
          departmentId: undefined,
          profileTypeId: defaultProfile,
          avatar: null,
        });
        setEditingUser(null);
        return;
      }

      form.reset({
        id: user.id,
        fullName: user.fullName ?? "",
        nickname: user.nickname ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "+55",
        departmentId: user.departmentId ?? undefined,
        profileTypeId: user.profileTypeId ?? defaultProfile,
        avatar: user.avatarUrl ?? null,
      });
      setEditingUser(user);
    },
    [form, profileTypesQuery.data]
  );

  const handleOpenCreate = () => {
    resetForm(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    resetForm(user);
    setIsDialogOpen(true);
  };

  const handleViewUser = (user: UserItem) => {
    setViewUser(user);
  };

  const handleDeleteUser = (id: number) => {
    deleteUserMutation.mutate({ id });
  };

  const onSubmit = (values: UserFormValues) => {
    const { id, ...payload } = values;
    if (id) {
      updateUserMutation.mutate({ ...payload, id });
      return;
    }
    createUserMutation.mutate(payload);
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file) {
      form.setValue("avatar", null);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    form.setValue("avatar", dataUrl, { shouldDirty: true });
  };

  const totalPages = usersQuery.data ? Math.ceil(usersQuery.data.total / pageSize) : 1;

  const profileOptions = profileTypesQuery.data ?? [];
  const departmentOptions = departmentsQuery.data ?? [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Cadastre, edite e gerencie os usuários internos do Help Desk.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail"
                value={searchTerm}
                onChange={(event) => {
                  setPage(1);
                  setSearchTerm(event.target.value);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={departmentFilter?.toString() ?? "all"}
              onValueChange={(value) => {
                setPage(1);
                setDepartmentFilter(value === "all" ? undefined : Number(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={profileFilter?.toString() ?? "all"}
              onValueChange={(value) => {
                setPage(1);
                setProfileFilter(value === "all" ? undefined : Number(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Perfil de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                {profileOptions.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id.toString()}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Usuários cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQuery.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Não foi possível carregar os usuários</AlertTitle>
                <AlertDescription>
                  {getFriendlyErrorMessage(usersQuery.error.message)}
                </AlertDescription>
              </Alert>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando usuários...
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!usersQuery.isLoading && usersQuery.data?.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                          <UserRound className="mb-3 h-8 w-8" />
                          <p>Nenhum usuário encontrado com os filtros atuais.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {usersQuery.data?.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {user.avatarUrl ? (
                              <AvatarImage src={user.avatarUrl} alt={user.fullName ?? user.email ?? ""} />
                            ) : null}
                            <AvatarFallback>
                              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName || user.nickname}</p>
                            <p className="text-sm text-muted-foreground">{user.nickname}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email ?? "-"}</TableCell>
                      <TableCell>{formatPhone(user.phone)}</TableCell>
                      <TableCell>{user.departmentName ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.profileName ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não poderá ser desfeita. Deseja continuar?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {usersQuery.data && usersQuery.data.total > 0 && (
              <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                  Mostrando{" "}
                  <span className="font-semibold">
                    {usersQuery.data.items.length}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold">{usersQuery.data.total}</span> registros
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Anterior
                  </Button>
                  <span>
                    Página {page} de {Math.max(totalPages, 1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            <DialogDescription>
              Preencha os dados obrigatórios para cadastrar operadores e administradores do sistema.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center gap-3 md:w-1/3">
                      <Avatar className="h-20 w-20">
                        {field.value ? <AvatarImage src={field.value} /> : null}
                        <AvatarFallback>
                          {(form.watch("fullName")?.charAt(0) ?? "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <FormLabel className="font-semibold">Avatar</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            await handleAvatarChange(file ?? null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome e sobrenome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apelido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Como o usuário será exibido"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="usuario@coopedu.com.br" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (+55)</FormLabel>
                      <FormControl>
                        <Input placeholder="+5511999999999" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select
                        value={field.value?.toString() ?? "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? undefined : Number(value))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">— Não definido —</SelectItem>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profileTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profileOptions.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id.toString()}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                  {(createUserMutation.isPending || updateUserMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingUser ? "Salvar alterações" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewUser)}
        onOpenChange={(open) => {
          if (!open) setViewUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do usuário</DialogTitle>
            <DialogDescription>Visualize as informações cadastradas.</DialogDescription>
          </DialogHeader>
          {viewUser ? (
            (() => {
              const user = viewUser as UserItem;
              return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
                  <AvatarFallback>
                    {user.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.fullName}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Apelido</p>
                  <p className="font-medium">{user.nickname || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{formatPhone(user.phone)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamento</p>
                  <p className="font-medium">{user.departmentName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Perfil</p>
                  <p className="font-medium">{user.profileName || "—"}</p>
                </div>
              </div>
            </div>
              );
            })()
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUser(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
