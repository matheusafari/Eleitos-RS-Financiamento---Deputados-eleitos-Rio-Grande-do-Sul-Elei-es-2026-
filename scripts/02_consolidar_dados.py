"""Consolida os CSVs extraídos numa base com uma linha por deputado eleito e gera os dados do dashboard.

Uso:
    python scripts/02_consolidar_dados.py

Entrada: dados/extraidos/*.csv (gerados por scripts/01_extrair_planilhas.py)

Saída:
    dados/processados/deputados_eleitos.csv
    dados/processados/deputados_eleitos.json
    docs/assets/js/dados.js   (os mesmos registros, carregados pelo dashboard)

Antes de gravar, o script confere deputado a deputado se as somas das listas batem
com os totais informados pelo TSE e para com erro se alguma conferência falhar.
"""
from pathlib import Path
import json
import sys

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
EXTRAIDOS = RAIZ / "dados" / "extraidos"
PROCESSADOS = RAIZ / "dados" / "processados"
DADOS_SITE = RAIZ / "docs" / "assets" / "js" / "dados.js"

CNPJ_FACEBOOK = "13.347.016/0001-17"  # FACEBOOK SERVICOS ONLINE DO BRASIL LTDA.
MILITANCIA = "ATIVIDADES DE MILITÂNCIA E MOBILIZAÇÃO DE RUA"
PESSOAL = "DESPESAS COM PESSOAL"
TERCEIROS = "SERVIÇOS PRESTADOS POR TERCEIROS"
IMPULSIONAMENTO = "DESPESA COM IMPULSIONAMENTO DE CONTEÚDOS"
DOACOES = "DOAÇÕES FINANCEIRAS A OUTROS CANDIDATOS/PARTIDOS"
TOLERANCIA = 0.02  # R$

COLUNAS = [
    "cargo", "nome_urna", "nome_completo", "partido", "numero", "genero", "cor_raca", "situacao",
    "votos", "contas_atualizadas_em",
    "receita_liquida", "receita_partidos", "receita_direcao_nacional", "receita_direcao_estadual",
    "receita_direcao_municipal", "receita_outros_candidatos", "receita_pessoas_fisicas",
    "receita_recursos_proprios", "receita_financiamento_coletivo", "receita_internet",
    "receita_aplicacoes", "receita_estimaveis", "doadores",
    "despesa_total", "despesa_contratada", "despesa_doacoes_outros_candidatos", "despesa_paga",
    "despesa_sobre_limite", "despesa_facebook", "lancamentos_facebook", "despesa_impulsionamento",
    "despesa_militancia_rua", "despesa_pessoal", "despesa_contratacao_pessoas",
    "despesa_servicos_terceiros", "pago_pessoas_fisicas", "pessoas_fisicas_pagas",
    "principal_tipo_despesa", "principal_tipo_despesa_pct", "fornecedores",
    "receita_por_voto", "despesa_por_voto",
]


def ler(nome: str) -> pd.DataFrame:
    caminho = EXTRAIDOS / nome
    if not caminho.exists():
        sys.exit(f"Falta {caminho.relative_to(RAIZ)}. Rode antes: python scripts/01_extrair_planilhas.py")
    return pd.read_csv(caminho, dtype={"CPF/CNPJ": str, "Número": int})


def r2(valor) -> float:
    return round(float(valor), 2)


def consolidar_cargo(cargo: str, rotulo: str, votos: pd.DataFrame, falhas: list) -> list:
    resumo = ler(f"{cargo}_resumo.csv")
    despesas = ler(f"{cargo}_despesas.csv")
    receitas = ler(f"{cargo}_receitas.csv")
    tipos = ler(f"{cargo}_tipos_despesa.csv")
    v = votos[votos["Cargo"] == rotulo].set_index("Número")

    faltando = set(v.index) ^ set(resumo["Número"])
    if faltando:
        falhas.append(f"{rotulo}: números sem par entre votos e prestação de contas: {sorted(faltando)}")

    linhas = []
    for _, x in resumo.iterrows():
        nome = x["Deputado(a)"].strip()
        if x["Número"] not in v.index:
            continue
        i = x["Nº"]
        ti = tipos[tipos["ID deputado"] == i]
        di = despesas[despesas["ID deputado"] == i]
        ri = receitas[receitas["ID deputado"] == i]

        por_tipo = ti.groupby("Tipo de despesa")["Valor (R$)"].sum()
        tipo = lambda t: float(por_tipo.get(t, 0.0))  # noqa: E731
        facebook = di[di["CPF/CNPJ"] == CNPJ_FACEBOOK]
        pessoas_fisicas = di[di["Tipo de documento"] == "CPF"]
        doador = ri["Doador"].astype(str)
        nacional = ri.loc[doador.str.startswith("DIREÇÃO NACIONAL"), "Valor (R$)"].sum()
        estadual = ri.loc[doador.str.startswith("DIREÇÃO ESTADUAL"), "Valor (R$)"].sum()
        municipal = ri.loc[doador.str.startswith("DIREÇÃO MUNICIPAL"), "Valor (R$)"].sum()
        e = v.loc[x["Número"]]

        d = {
            "cargo": rotulo,
            "nome_urna": nome,
            "nome_completo": x["Nome completo"],
            "partido": x["Partido"],
            "numero": int(x["Número"]),
            "genero": x["Gênero"],
            "cor_raca": x["Cor/raça"],
            "situacao": x["Resultado na eleição"],
            "votos": int(e["Votos"]),
            "contas_atualizadas_em": x["Contas atualizadas em"],
            "receita_liquida": r2(x["Receita líquida"]),
            "receita_partidos": r2(x["De partidos"]),
            "receita_direcao_nacional": r2(nacional),
            "receita_direcao_estadual": r2(estadual),
            "receita_direcao_municipal": r2(municipal),
            "receita_outros_candidatos": r2(x["De outros candidatos"]),
            "receita_pessoas_fisicas": r2(x["De pessoas físicas"]),
            "receita_recursos_proprios": r2(x["Recursos próprios"]),
            "receita_financiamento_coletivo": r2(x["Financiamento coletivo"]),
            "receita_internet": r2(x["Pela internet"]),
            "receita_aplicacoes": r2(x["Aplicações e outras"]),
            "receita_estimaveis": r2(x["Recursos estimáveis (incluídos na receita)"]),
            "doadores": int(x["Doadores (nº)"]),
            "despesa_total": r2(x["Despesas totais"]),
            "despesa_contratada": r2(x["Despesas contratadas"]),
            "despesa_doacoes_outros_candidatos": r2(x["Doações a outros candidatos"]),
            "despesa_paga": r2(x["Despesas pagas"]),
            "despesa_sobre_limite": round(float(x["Despesas totais ÷ limite legal"]), 4),
            "despesa_facebook": r2(facebook["Valor (R$)"].sum()),
            "lancamentos_facebook": int(facebook["Lançamentos"].sum()),
            "despesa_impulsionamento": r2(tipo(IMPULSIONAMENTO)),
            "despesa_militancia_rua": r2(tipo(MILITANCIA)),
            "despesa_pessoal": r2(tipo(PESSOAL)),
            "despesa_contratacao_pessoas": r2(tipo(MILITANCIA) + tipo(PESSOAL)),
            "despesa_servicos_terceiros": r2(tipo(TERCEIROS)),
            "pago_pessoas_fisicas": r2(pessoas_fisicas["Valor (R$)"].sum()),
            "pessoas_fisicas_pagas": int(len(pessoas_fisicas)),
            "principal_tipo_despesa": x["Principal tipo de despesa"] if pd.notna(x["Principal tipo de despesa"]) else None,
            "principal_tipo_despesa_pct": round(float(x["% do principal tipo"]), 4) if pd.notna(x["% do principal tipo"]) else None,
            "fornecedores": int(x["Fornecedores (nº)"]),
        }
        d["receita_por_voto"] = r2(d["receita_liquida"] / d["votos"])
        d["despesa_por_voto"] = r2(d["despesa_total"] / d["votos"])

        conferencias = {
            "nome de urna igual na votação": e["Nome de urna"].strip() == nome,
            "situação igual na votação": e["Situação"] == d["situacao"],
            "despesas por tipo = despesa total": abs(ti["Valor (R$)"].sum() - d["despesa_total"]) < TOLERANCIA,
            "despesas por fornecedor = despesa total": abs(di["Valor (R$)"].sum() - d["despesa_total"]) < TOLERANCIA,
            "contratadas + doações = despesa total": abs(d["despesa_contratada"] + d["despesa_doacoes_outros_candidatos"] - d["despesa_total"]) < TOLERANCIA,
            "doações por tipo = doações a outros candidatos": abs(tipo(DOACOES) - d["despesa_doacoes_outros_candidatos"]) < TOLERANCIA,
            "direções partidárias = receita de partidos": abs(nacional + estadual + municipal - d["receita_partidos"]) < TOLERANCIA,
            "origens = receita líquida": abs(
                d["receita_partidos"] + d["receita_pessoas_fisicas"] + d["receita_outros_candidatos"]
                + d["receita_recursos_proprios"] + d["receita_financiamento_coletivo"]
                + d["receita_internet"] + d["receita_aplicacoes"] - d["receita_liquida"]) < TOLERANCIA,
        }
        falhas += [f"{rotulo} · {nome}: {regra}" for regra, ok in conferencias.items() if not ok]
        linhas.append(d)
    return linhas


def main() -> None:
    votos = ler("votos_eleitos.csv")
    falhas: list = []
    linhas = consolidar_cargo("federal", "Federal", votos, falhas) + consolidar_cargo("estadual", "Estadual", votos, falhas)
    if falhas:
        print("Conferências que falharam:")
        print("\n".join(f"  - {f}" for f in falhas))
        sys.exit(1)

    base = pd.DataFrame(linhas)[COLUNAS]
    base["_ordem"] = base["cargo"].map({"Federal": 0, "Estadual": 1})
    base = base.sort_values(["_ordem", "votos"], ascending=[True, False]).drop(columns="_ordem")
    registros = json.loads(base.to_json(orient="records", force_ascii=False))

    PROCESSADOS.mkdir(parents=True, exist_ok=True)
    base.to_csv(PROCESSADOS / "deputados_eleitos.csv", index=False, encoding="utf-8")
    (PROCESSADOS / "deputados_eleitos.json").write_text(
        json.dumps(registros, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    DADOS_SITE.parent.mkdir(parents=True, exist_ok=True)
    DADOS_SITE.write_text(
        "// Gerado por scripts/02_consolidar_dados.py. Não edite à mão: rode o script de novo.\n"
        "window.DADOS = [\n"
        + ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in registros)
        + "\n];\n", encoding="utf-8")

    print(f"{len(base)} deputados consolidados; todas as conferências passaram.")
    for rotulo, g in base.groupby("cargo", sort=False):
        print(f"  {rotulo}: {len(g)} deputados · receita R$ {g['receita_liquida'].sum():,.2f}"
              f" · despesa R$ {g['despesa_total'].sum():,.2f} · votos {g['votos'].sum():,}")
    for caminho in [PROCESSADOS / "deputados_eleitos.csv", PROCESSADOS / "deputados_eleitos.json", DADOS_SITE]:
        print(f"  gravado {caminho.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
