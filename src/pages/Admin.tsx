import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/cogede/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Users, Shield, Edit, ArrowLeft, Package, Trash2, AlertTriangle, RotateCcw, UserX } from "lucide-react";
import { logger } from "@/lib/logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Lote {
  id: string;
  nome: string | null;
  total_processos: number;
  created_at: string;
  ativo: boolean;
}

interface UserWithRole {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  role: AppRole;
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  avaliador: "Avaliador",
};

const roleBadgeVariants: Record<AppRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  supervisor: "secondary",
  avaliador: "outline",
};

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLotes, setLoadingLotes] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("avaliador");
  const [deleteLoteDialog, setDeleteLoteDialog] = useState(false);
  const [loteToDelete, setLoteToDelete] = useState<Lote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetSystemDialog, setResetSystemDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchLotes();
    }
  }, [isAdmin]);

  const fetchLotes = async () => {
    setLoadingLotes(true);
    try {
      const { data, error } = await supabase
        .from("lotes_importacao")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLotes(data || []);
    } catch (error) {
      logger.error("Error fetching lotes:", error);
    } finally {
      setLoadingLotes(false);
    }
  };

  const handleDeleteLote = async () => {
    if (!loteToDelete) return;
    setIsDeleting(true);
    try {
      // First delete related avaliacoes
      const { data: processos } = await supabase
        .from("processos_fila")
        .select("id")
        .eq("lote_id", loteToDelete.id);
      
      if (processos && processos.length > 0) {
        const processoIds = processos.map(p => p.id);
        await supabase.from("avaliacoes").delete().in("processo_id", processoIds);
      }
      
      // Delete processos
      await supabase.from("processos_fila").delete().eq("lote_id", loteToDelete.id);
      
      // Delete lote
      const { error } = await supabase.from("lotes_importacao").delete().eq("id", loteToDelete.id);
      
      if (error) throw error;
      
      toast.success("Lote e processos excluídos com sucesso!");
      fetchLotes();
    } catch (error) {
      logger.error("Error deleting lote:", error);
      toast.error("Erro ao excluir lote");
    } finally {
      setIsDeleting(false);
      setDeleteLoteDialog(false);
      setLoteToDelete(null);
    }
  };

  const handleResetSystem = async () => {
    setIsResetting(true);
    try {
      // Get all lotes
      const { data: allLotes } = await supabase.from("lotes_importacao").select("id");
      
      if (allLotes && allLotes.length > 0) {
        const loteIds = allLotes.map(l => l.id);
        
        // Get all processos
        const { data: allProcessos } = await supabase
          .from("processos_fila")
          .select("id")
          .in("lote_id", loteIds);
        
        if (allProcessos && allProcessos.length > 0) {
          const processoIds = allProcessos.map(p => p.id);
          // Delete all avaliacoes
          await supabase.from("avaliacoes").delete().in("processo_id", processoIds);
        }
        
        // Delete all processos
        await supabase.from("processos_fila").delete().in("lote_id", loteIds);
        
        // Delete all lotes
        await supabase.from("lotes_importacao").delete().in("id", loteIds);
      }
      
      toast.success("Sistema resetado com sucesso! Todos os dados foram apagados.");
      fetchLotes();
    } catch (error) {
      logger.error("Error resetting system:", error);
      toast.error("Erro ao resetar sistema");
    } finally {
      setIsResetting(false);
      setResetSystemDialog(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !user?.id) return;
    
    setIsDeletingUser(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('delete-user', {
        body: { userId: userToDelete.user_id, selfDelete: false },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao excluir usuário');
      }

      toast.success(`Usuário ${userToDelete.nome} excluído com sucesso!`);
      fetchUsers();
    } catch (error: unknown) {
      logger.error("Error deleting user:", error);
      toast.error("Erro ao excluir usuário");
    } finally {
      setIsDeletingUser(false);
      setDeleteUserDialog(false);
      setUserToDelete(null);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          nome: profile.nome,
          email: profile.email,
          role: (userRole?.role as AppRole) || "avaliador",
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: unknown) {
      logger.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: UserWithRole) => {
    setEditingUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", editingUser.user_id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      setDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: unknown) {
      logger.error("Error updating role:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Administração de Usuários
            </h1>
            <p className="text-muted-foreground">
              Gerencie os usuários e seus perfis de acesso
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Supervisores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "supervisor").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "avaliador").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Cadastrados
            </CardTitle>
            <CardDescription>
              Lista de todos os usuários do sistema e seus perfis de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell className="font-medium">{userItem.nome}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariants[userItem.role]}>
                        {roleLabels[userItem.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userItem.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(userItem)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setUserToDelete(userItem);
                          setDeleteUserDialog(true);
                        }}
                        disabled={userItem.user_id === user?.id}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário cadastrado ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciamento de Lotes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gerenciamento de Lotes
                </CardTitle>
                <CardDescription>
                  Gerencie os lotes de importação e seus processos
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setResetSystemDialog(true)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Sistema
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingLotes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : lotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lote cadastrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Lote</TableHead>
                    <TableHead>Processos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell className="font-medium">
                        {lote.nome || `Lote ${new Date(lote.created_at).toLocaleDateString("pt-BR")}`}
                      </TableCell>
                      <TableCell>{lote.total_processos}</TableCell>
                      <TableCell>
                        <Badge variant={lote.ativo ? "default" : "secondary"}>
                          {lote.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(lote.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setLoteToDelete(lote);
                            setDeleteLoteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog para editar role */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Perfil de Acesso</DialogTitle>
              <DialogDescription>
                Altere o perfil de acesso do usuário {editingUser?.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Perfil de Acesso</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avaliador">
                      <div className="flex flex-col items-start">
                        <span>Avaliador</span>
                        <span className="text-xs text-muted-foreground">
                          Executa avaliações documentais
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisor">
                      <div className="flex flex-col items-start">
                        <span>Supervisor</span>
                        <span className="text-xs text-muted-foreground">
                          Responsável pela atividade, visualiza todos os dados
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex flex-col items-start">
                        <span>Administrador</span>
                        <span className="text-xs text-muted-foreground">
                          Poderes totais para editar o sistema
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveRole}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para deletar lote */}
        <AlertDialog open={deleteLoteDialog} onOpenChange={setDeleteLoteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Excluir Lote
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o lote "{loteToDelete?.nome || 'Sem nome'}" e todos os seus {loteToDelete?.total_processos || 0} processos? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteLote}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog para resetar sistema */}
        <AlertDialog open={resetSystemDialog} onOpenChange={setResetSystemDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Resetar Sistema
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  <strong>ATENÇÃO:</strong> Esta ação irá apagar TODOS os dados do sistema:
                </p>
                <ul className="list-disc list-inside text-sm">
                  <li>Todos os lotes de importação</li>
                  <li>Todos os processos</li>
                  <li>Todas as avaliações realizadas</li>
                </ul>
                <p className="font-semibold text-destructive">
                  Esta ação NÃO pode ser desfeita!
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetSystem}
                disabled={isResetting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isResetting ? "Resetando..." : "Confirmar Reset"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog para deletar usuário */}
        <AlertDialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-destructive" />
                Excluir Usuário
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário "{userToDelete?.nome}"? 
                Esta ação irá remover o usuário e todas as suas avaliações.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingUser ? "Excluindo..." : "Confirmar Exclusão"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
