# Dados

| Pasta | Conteúdo | Gerado por |
|---|---|---|
| `originais/` | Planilhas .xlsx de origem. Ficam fora do Git porque têm CPFs completos. | você (veja `originais/LEIA-ME.md`) |
| `extraidos/` | As abas usadas das planilhas, em CSV, com CPFs mascarados | `scripts/01_extrair_planilhas.py` |
| `processados/` | Base consolidada, uma linha por deputado eleito | `scripts/02_consolidar_dados.py` |

## extraidos/

- `federal_resumo.csv`, `estadual_resumo.csv`: uma linha por deputado com o resumo da prestação de contas (receita por origem, despesas, limite legal, saldo, maior doador e maior fornecedor).
- `federal_despesas.csv`, `estadual_despesas.csv`: uma linha por fornecedor de cada deputado, com valor e número de lançamentos.
- `federal_receitas.csv`, `estadual_receitas.csv`: uma linha por doador de cada deputado.
- `federal_tipos_despesa.csv`, `estadual_tipos_despesa.csv`: despesas de cada deputado por tipo, como classificadas na prestação.
- `votos_eleitos.csv`: votos nominais e situação (eleito por QP ou por média) de cada eleito.

## processados/deputados_eleitos.csv

O mesmo conteúdo está em `deputados_eleitos.json` e em `docs/assets/js/dados.js`, que o dashboard carrega. Valores em reais. Colunas com "pct" ou "sobre" são frações entre 0 e 1.

| Coluna | Descrição |
|---|---|
| `cargo` | Federal ou Estadual |
| `nome_urna` | Nome de urna |
| `nome_completo` | Nome civil |
| `partido` | Partido |
| `numero` | Número de urna |
| `genero` | Gênero declarado ao TSE |
| `cor_raca` | Cor/raça declarada ao TSE |
| `situacao` | Eleito por QP (quociente partidário) ou Eleito por média |
| `votos` | Votos nominais no 1º turno |
| `contas_atualizadas_em` | Data da última atualização da prestação de contas (AAAA-MM-DD) |
| `receita_liquida` | Total recebido, descontadas as devoluções. Inclui recursos estimáveis |
| `receita_partidos` | Recebido de direções partidárias, de todas as esferas |
| `receita_direcao_nacional` | Parte de `receita_partidos` vinda de direções nacionais |
| `receita_direcao_estadual` | Parte vinda de direções estaduais |
| `receita_direcao_municipal` | Parte vinda de direções municipais |
| `receita_outros_candidatos` | Recebido de outros candidatos |
| `receita_pessoas_fisicas` | Doações de pessoas físicas |
| `receita_recursos_proprios` | Recursos do próprio candidato |
| `receita_financiamento_coletivo` | Financiamento coletivo (vaquinha virtual) |
| `receita_internet` | Doações pela internet |
| `receita_aplicacoes` | Aplicações financeiras e outras |
| `receita_estimaveis` | Parte da receita em bens e serviços, já incluída nas origens acima |
| `doadores` | Número de doadores |
| `despesa_total` | Total de despesas, incluindo doações a outros candidatos |
| `despesa_contratada` | Despesas da própria campanha (total menos doações a outros candidatos) |
| `despesa_doacoes_outros_candidatos` | Doações feitas a outros candidatos ou partidos |
| `despesa_paga` | Despesas pagas até a data de atualização |
| `despesa_sobre_limite` | Despesa total ÷ limite legal do cargo (R$ 3.176.572,53 federal; R$ 1.270.629,01 estadual) |
| `despesa_facebook` | Pagamentos ao CNPJ 13.347.016/0001-17 (Facebook Serviços Online do Brasil Ltda.) |
| `lancamentos_facebook` | Número de lançamentos de despesa com o Facebook |
| `despesa_impulsionamento` | Tipo "Despesa com impulsionamento de conteúdos", em todas as plataformas |
| `despesa_militancia_rua` | Tipo "Atividades de militância e mobilização de rua" |
| `despesa_pessoal` | Tipo "Despesas com pessoal" |
| `despesa_contratacao_pessoas` | `despesa_militancia_rua` + `despesa_pessoal` |
| `despesa_servicos_terceiros` | Tipo "Serviços prestados por terceiros" (não entra em contratação de pessoas) |
| `pago_pessoas_fisicas` | Total pago a fornecedores identificados por CPF |
| `pessoas_fisicas_pagas` | Número de fornecedores identificados por CPF |
| `principal_tipo_despesa` | Tipo de despesa de maior valor |
| `principal_tipo_despesa_pct` | Fração da despesa total no principal tipo |
| `fornecedores` | Número de fornecedores |
| `receita_por_voto` | `receita_liquida` ÷ `votos` |
| `despesa_por_voto` | `despesa_total` ÷ `votos` |
