"""Extrai das planilhas originais (.xlsx) as abas usadas pelo projeto e grava em CSV.

Uso:
    python scripts/01_extrair_planilhas.py

Entrada: dados/originais/
    *federais*.xlsx   prestação de contas dos deputados federais eleitos
    *estaduais*.xlsx  prestação de contas dos deputados estaduais eleitos
    *eleitos*.xlsx    votação dos eleitos (TSE, 1º turno)

Saída: dados/extraidos/
    federal_resumo.csv, federal_despesas.csv, federal_receitas.csv, federal_tipos_despesa.csv
    estadual_resumo.csv, estadual_despesas.csv, estadual_receitas.csv, estadual_tipos_despesa.csv
    votos_eleitos.csv

As planilhas originais trazem o CPF completo de doadores e fornecedores pessoas
físicas. Nos CSVs gerados aqui o CPF fica mascarado no padrão do Portal da
Transparência (***.456.789-**), inclusive quando aparece dentro do nome (razão
social de MEI, que leva o CPF do dono). Os CNPJs ficam completos.
"""
from pathlib import Path
import re
import sys

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
ORIGINAIS = RAIZ / "dados" / "originais"
EXTRAIDOS = RAIZ / "dados" / "extraidos"

CPF = re.compile(r"^\d{3}\.(\d{3})\.(\d{3})-\d{2}$")
CPF_NO_TEXTO = re.compile(r"(?<!\d)\d{3}\.?(\d{3})\.?(\d{3})-?\d{2}(?!\d)")
COLUNAS_DE_NOME = ["Fornecedor", "Doador", "Maior doador", "Maior fornecedor"]


def achar_planilha(padrao: str) -> Path:
    arquivos = sorted(p for p in ORIGINAIS.glob(padrao) if not p.name.startswith("~$"))
    if not arquivos:
        sys.exit(f"Não encontrei nenhum arquivo '{padrao}' em {ORIGINAIS}")
    if len(arquivos) > 1:
        nomes = ", ".join(a.name for a in arquivos)
        sys.exit(f"Há mais de um arquivo '{padrao}' em {ORIGINAIS}: {nomes}. Deixe só um.")
    return arquivos[0]


def mascarar_documento(doc, tipo):
    """Mascara CPF (mantém os 6 dígitos do meio). CNPJ e vazios passam inalterados."""
    if tipo != "CPF" or not isinstance(doc, str):
        return doc
    m = CPF.match(doc.strip())
    return f"***.{m.group(1)}.{m.group(2)}-**" if m else "***.***.***-**"


def mascarar_cpf_no_nome(nome):
    """Mascara números com cara de CPF dentro de nomes, como em 'FULANO DE TAL 12345678900'."""
    if not isinstance(nome, str):
        return nome
    return CPF_NO_TEXTO.sub(lambda m: f"***.{m.group(1)}.{m.group(2)}-**", nome)


def limpar(df: pd.DataFrame) -> pd.DataFrame:
    """Mascara CPFs em colunas de nome e tira o ruído de ponto flutuante (2784.78000000003)."""
    for col in COLUNAS_DE_NOME:
        if col in df.columns:
            df[col] = df[col].map(mascarar_cpf_no_nome)
    for col in df.select_dtypes("float").columns:
        df[col] = df[col].round(6)
    return df


def ler_resumo(xlsx: Path) -> pd.DataFrame:
    df = pd.read_excel(xlsx, "Resumo por deputado", header=3)
    df = df[df["Nº"].notna()].copy()  # tira as linhas de total e média do rodapé
    df["Nº"] = df["Nº"].astype(int)
    df["Número"] = df["Número"].astype(int)
    df["Contas atualizadas em"] = pd.to_datetime(df["Contas atualizadas em"]).dt.strftime("%Y-%m-%d")
    return df


def ler_lista(xlsx: Path, aba: str, mascarar: bool = False) -> pd.DataFrame:
    df = pd.read_excel(xlsx, aba)
    df = df[df["ID deputado"].notna()].copy()
    df["ID deputado"] = df["ID deputado"].astype(int)
    if mascarar:
        df["CPF/CNPJ"] = [mascarar_documento(d, t) for d, t in zip(df["CPF/CNPJ"], df["Tipo de documento"])]
    return df


def ler_votos(xlsx: Path) -> pd.DataFrame:
    partes = []
    for aba, cargo in [("Deputados Federais", "Federal"), ("Deputados Estaduais", "Estadual")]:
        df = pd.read_excel(xlsx, aba, header=3)
        df = df[df["Número"].notna()].copy()  # tira total e nota de fonte
        df.insert(0, "Cargo", cargo)
        df["#"] = df["#"].astype(int)
        df["Número"] = df["Número"].astype(int)
        df["Votos"] = df["Votos"].astype(int)
        partes.append(df)
    return pd.concat(partes, ignore_index=True)


def gravar(df: pd.DataFrame, nome: str) -> None:
    caminho = EXTRAIDOS / nome
    limpar(df).to_csv(caminho, index=False, encoding="utf-8")
    print(f"  {caminho.relative_to(RAIZ)}  ({len(df)} linhas)")


def main() -> None:
    EXTRAIDOS.mkdir(parents=True, exist_ok=True)
    print("Gravando:")
    for cargo, padrao in [("federal", "*federais*.xlsx"), ("estadual", "*estaduais*.xlsx")]:
        xlsx = achar_planilha(padrao)
        gravar(ler_resumo(xlsx), f"{cargo}_resumo.csv")
        gravar(ler_lista(xlsx, "Despesas", mascarar=True), f"{cargo}_despesas.csv")
        gravar(ler_lista(xlsx, "Receitas", mascarar=True), f"{cargo}_receitas.csv")
        gravar(ler_lista(xlsx, "Tipos de despesa"), f"{cargo}_tipos_despesa.csv")
    gravar(ler_votos(achar_planilha("*eleitos*.xlsx")), "votos_eleitos.csv")


if __name__ == "__main__":
    main()
