# Planilhas originais

Coloque aqui as três planilhas .xlsx que o script `scripts/01_extrair_planilhas.py` lê. O nome de cada arquivo só precisa conter a palavra indicada:

| O nome contém | Conteúdo |
|---|---|
| `federais` | Prestação de contas dos deputados federais eleitos (abas Resumo por deputado, Despesas, Receitas e Tipos de despesa) |
| `estaduais` | O mesmo para os deputados estaduais eleitos |
| `eleitos` | Votação dos eleitos (abas Deputados Federais e Deputados Estaduais) |

Esta pasta fica fora do Git (veja `.gitignore`) porque as planilhas trazem o CPF completo de doadores e fornecedores. Os CSVs de `dados/extraidos/` já saem com os CPFs mascarados.
