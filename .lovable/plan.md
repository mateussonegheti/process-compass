

# Consolidar Divergencias na Exportacao CSV

## Resumo

Substituir as 2 colunas separadas (`TIPO_INFORMADO_SISTEMA` e `TIPO_REAL_IDENTIFICADO`) por uma unica coluna consolidada que inclui tambem o ID da peca divergente.

## Formato da nova coluna

| DIVERGENCIA_TIPO_INFORMADO_X_REAL |
|---|
| Despacho x Sentenca - 98758 |
| Despacho x Sentenca - 98758 \| Voto de Sessao x Voto - 2503414 |

A coluna `CLASSIFICACAO_DIVERGENTE` (Sim/Nao) permanece inalterada.

## Mudancas tecnicas em `src/components/cogede/PainelSupervisor.tsx`

### 1. Template de colunas (`COLUNAS_EXPORTACAO`)

- **Remover** estas 2 entradas:
  - `{ key: "tipoInformadoSistema", label: "TIPO_INFORMADO_SISTEMA" }`
  - `{ key: "tipoRealIdentificado", label: "TIPO_REAL_IDENTIFICADO" }`
- **Adicionar** no mesmo local:
  - `{ key: "divergenciaConsolidada", label: "DIVERGENCIA_TIPO_INFORMADO_X_REAL", grupo: "Ocorrencias" }`

### 2. Carregamento dos dados (`carregarAvaliacoes`)

- Adicionar o campo `divergencias_detalhes` na query de SELECT da tabela `avaliacoes`
- Mapear para a propriedade `divergenciasDetalhes` no objeto consolidado

### 3. Logica de exportacao (`exportarAvaliacoes`)

Adicionar tratamento especial para o campo `divergenciaConsolidada`:

- Se `divergenciaClassificacao === "Sim"` e existe `divergenciasDetalhes`:
  - Fazer parse do formato salvo: `Tipo1 -> Real1 (ID: id1) | Tipo2 -> Real2 (ID: id2)`
  - Reformatar para: `Tipo1 x Real1 - id1 | Tipo2 x Real2 - id2`
- Caso contrario: deixar vazio

### 4. Tipo `AvaliacaoConsolidada`

- Remover `tipoInformadoSistema` e `tipoRealIdentificado` (opcionais no tipo)
- Adicionar `divergenciasDetalhes?: string`

## Exemplo pratico

Dado salvo no banco (`divergencias_detalhes`):
```
Despacho → Sentença (ID: 98758) | Voto de Sessão → Voto (ID: 2503414)
```

Exportado na planilha:
```
Despacho x Sentença - 98758 | Voto de Sessão x Voto - 2503414
```

## Arquivos afetados

- `src/components/cogede/PainelSupervisor.tsx` (unico arquivo)
