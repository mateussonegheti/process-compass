import { useState } from "react";
import { FileText, LogOut, Shield, KeyRound, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  avaliador: "Avaliador"
};

const roleBadgeVariants: Record<AppRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  supervisor: "secondary",
  avaliador: "outline"
};

export function Header() {
  const navigate = useNavigate();
  const { profile, role, signOut, isAdmin, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (!profile?.email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      toast.error("Erro ao enviar email de alteração de senha");
    } else {
      toast.success("Email enviado! Verifique sua caixa de entrada para alterar sua senha.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id, selfDelete: true },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao excluir conta');
      }

      toast.success("Conta excluída com sucesso!");
      navigate("/login");
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      toast.error("Erro ao excluir conta. Tente novamente ou contate o administrador.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getInitials = (nome: string) => {
    return nome.
    split(" ").
    map((n) => n[0]).
    slice(0, 2).
    join("").
    toUpperCase();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/inicio")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity">

            <img alt="SINVAL" className="h-10 w-10 shadow" src="/lovable-uploads/97745647-b58e-4196-ab84-d5ef53592d60.png" />
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight">SINVAL</h1>
              <p className="text-sm text-primary-foreground/80">
                Sistema Integrado de Avaliação
              </p>
            </div>
          </button>

          {profile &&
          <div className="flex items-center gap-3">
              {role &&
            <Badge
              variant={roleBadgeVariants[role]}
              className="hidden sm:flex bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">

                  {roleLabels[role]}
                </Badge>
            }

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">

                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-transparent text-primary-foreground">
                        {getInitials(profile.nome)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile.nome}</p>
                      <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                      {role &&
                    <Badge variant={roleBadgeVariants[role]} className="w-fit mt-2">
                          {roleLabels[role]}
                        </Badge>
                    }
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin &&
                <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Administração
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                }
                  <DropdownMenuItem onClick={handleChangePassword}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </DropdownMenuItem>
                  <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive">

                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Conta
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta? 
              Esta ação não pode ser desfeita e todos os seus dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">

              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>);

}