#!/bin/bash
# Script para configurar o Supabase externo
# Execute este script linha por linha no terminal

set -e

echo "🔐 Passo 1: Login no Supabase CLI"
echo "Este comando abrirá o navegador para autenticação"
npx supabase login

echo ""
echo "🔗 Passo 2: Linkar ao projeto externo"
echo "Você precisará fornecer a senha do banco de dados quando solicitado"
npx supabase link --project-ref suvbaofilczyxquuinwj

echo ""
echo "📊 Passo 3: Verificar migrations existentes no banco remoto"
npx supabase db remote list

echo ""
echo "🚀 Passo 4: Aplicar migrations ao banco remoto"
echo "ATENÇÃO: Este comando aplicará TODAS as migrations ao seu banco"
read -p "Deseja continuar? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]
then
    npx supabase db push
    echo "✅ Migrations aplicadas com sucesso!"
else
    echo "❌ Aplicação de migrations cancelada"
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📝 Próximos passos:"
echo "1. Teste a aplicação: npm run dev"
echo "2. Faça commit: git add supabase/config.toml && git commit -m 'config: atualizar para Supabase externo'"
echo "3. Push: git push origin main"
