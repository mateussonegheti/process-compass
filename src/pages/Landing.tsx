import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import sinvalLogo from "@/assets/sinval-logo.png";
import sinvalIcon from "@/assets/sinval-icon.png";
import {
  FileSearch,
  CheckCircle2,
  BarChart3,
  Users,
  Shield,
  Clock,
  ArrowRight,
  Link2,
  Layers,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={sinvalIcon} alt="SINVAL" className="h-10 w-10" />
            <span className="text-xl font-bold font-display tracking-tight text-foreground">
              SINVAL
            </span>
          </div>
          <Link to="/login">
            <Button variant="default" size="sm">
              Acessar Sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-hero text-snow py-24 lg:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <img
            src={sinvalLogo}
            alt="SINVAL"
            className="mx-auto h-24 w-auto mb-8 drop-shadow-lg brightness-0 invert"
          />
          <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4 leading-tight">
            Sistema Integrado de Avaliação
          </h1>
          <p className="text-lg text-snow/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Plataforma desenvolvida para padronizar e agilizar a avaliação de
            processos judiciais eletrônicos, garantindo conformidade com a
            Tabela de Temporalidade e a gestão documental do Poder Judiciário.
          </p>
          <Link to="/login">
            <Button size="lg" className="btn-accent text-lg px-10">
              Entrar no SINVAL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Origem */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold font-display text-center mb-6 text-foreground">
            De onde surgiu o SINVAL?
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            <p>
              O SINVAL nasceu da necessidade prática enfrentada pela{" "}
              <strong className="text-foreground">
                Coordenação de Gestão de Documentos Eletrônicos (COGEDE)
              </strong>{" "}
              do Tribunal de Justiça do Espírito Santo. Diante do volume
              crescente de processos judiciais eletrônicos que precisam ser
              avaliados antes da destinação final — seja eliminação, guarda
              temporária ou guarda permanente — ficou evidente que o modelo
              manual em planilhas era lento, propenso a erros e difícil de
              supervisionar.
            </p>
            <p>
              O sistema foi concebido para substituir esse fluxo por uma
              plataforma integrada, onde cada avaliador recebe processos de
              forma automática, preenche um formulário estruturado e o
              supervisor acompanha tudo em tempo real com dashboards e
              relatórios consolidados.
            </p>
          </div>
        </div>
      </section>

      {/* Para que serve */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold font-display text-center mb-12 text-foreground">
            Para que serve?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileSearch,
                title: "Avaliação Estruturada",
                desc: "Formulário padronizado que guia o avaliador por todos os critérios exigidos pela Tabela de Temporalidade.",
              },
              {
                icon: Layers,
                title: "Fila Inteligente",
                desc: "Distribuição automática de processos pendentes, evitando duplicidade e conflitos entre avaliadores.",
              },
              {
                icon: BarChart3,
                title: "Dashboard em Tempo Real",
                desc: "Supervisores acompanham o progresso da equipe, taxas de conclusão e métricas de produtividade.",
              },
              {
                icon: Link2,
                title: "Merge de Planilhas",
                desc: "Consolidação automatizada de dados de movimentos, peças e informações processuais em um único lote.",
              },
              {
                icon: Users,
                title: "Gestão de Equipes",
                desc: "Controle de papéis (Administrador, Supervisor, Avaliador) com permissões granulares via RLS.",
              },
              {
                icon: Shield,
                title: "Segurança e Auditoria",
                desc: "Autenticação robusta, políticas de acesso por linha e rastreabilidade completa de cada avaliação.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="glass-card shadow-card hover:shadow-card-hover transition-shadow duration-300"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fluxo */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold font-display text-center mb-12 text-foreground">
            Como funciona?
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                icon: Layers,
                title: "Importação do Lote",
                desc: "O supervisor importa a planilha com os processos a serem avaliados. O sistema valida e organiza automaticamente.",
              },
              {
                step: "2",
                icon: FileSearch,
                title: "Avaliação Individual",
                desc: "Cada avaliador inicia sua sessão e recebe processos um a um, preenchendo o formulário de avaliação com base nos documentos e movimentos.",
              },
              {
                step: "3",
                icon: CheckCircle2,
                title: "Salvamento e Próximo",
                desc: 'Ao concluir, o avaliador salva e recebe automaticamente o próximo processo pendente — "Salvar e Próximo".',
              },
              {
                step: "4",
                icon: BarChart3,
                title: "Supervisão e Exportação",
                desc: "O supervisor monitora o progresso pelo dashboard, revisa avaliações e exporta os resultados consolidados.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-hero text-snow">
        <div className="container mx-auto px-4 text-center">
          <Clock className="mx-auto h-10 w-10 mb-4 text-pearl-aqua" />
          <h2 className="text-2xl font-bold font-display mb-3">
            Pronto para começar?
          </h2>
          <p className="text-snow/70 mb-6 max-w-md mx-auto">
            Acesse o sistema com suas credenciais ou solicite acesso à equipe
            administrativa.
          </p>
          <Link to="/login">
            <Button size="lg" className="btn-accent">
              Acessar o SINVAL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            SINVAL — Sistema Integrado de Avaliação · Desenvolvido para a COGEDE
            / TJES
          </p>
        </div>
      </footer>
    </div>
  );
}
