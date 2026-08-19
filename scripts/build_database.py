import sys
import os
import ssl
import io
import urllib.request
import shutil

# Bypass SSL certificate verification if certificate has expired on remote server
ssl._create_default_https_context = ssl._create_unverified_context

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import pandas as pd
import sqlite3
import itertools
from collections import defaultdict

print("[1/4] Baixando e carregando dados brutos do Transfermarkt...")
BASE_URL = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def download_csv(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        content = response.read()
        return pd.read_csv(io.BytesIO(content), compression="gzip")

try:
    print("   -> Baixando players.csv.gz...")
    players_df = download_csv(f"{BASE_URL}/players.csv.gz")
    
    print("   -> Baixando clubs.csv.gz...")
    clubs_df = download_csv(f"{BASE_URL}/clubs.csv.gz")
    
    print("   -> Baixando games.csv.gz...")
    games_df = download_csv(f"{BASE_URL}/games.csv.gz")
    
    print("   -> Baixando appearances.csv.gz...")
    appearances_df = download_csv(f"{BASE_URL}/appearances.csv.gz")
except Exception as e:
    print(f"Erro ao baixar arquivos: {e}")
    raise e

print("[2/4] Limpando e calculando estatísticas consolidadas dos jogadores...")
club_map = clubs_df.set_index("club_id")["name"].to_dict()

# Contagem real de jogos por jogador
games_count = appearances_df.groupby("player_id").size().to_dict()

players_clean = players_df[[
    "player_id", 
    "name", 
    "country_of_citizenship", 
    "current_club_name", 
    "image_url",
    "highest_market_value_in_eur",
    "height_in_cm"
]].copy()

players_clean.rename(columns={
    "player_id": "id",
    "country_of_citizenship": "country",
    "current_club_name": "current_team",
    "image_url": "photo",
    "highest_market_value_in_eur": "highest_market_value",
    "height_in_cm": "height_in_cm"
}, inplace=True)

players_clean["search_name"] = players_clean["name"].str.lower()
players_clean["country"] = players_clean["country"].fillna("")
players_clean["current_team"] = players_clean["current_team"].fillna("Desconhecido")
players_clean["photo"] = players_clean["photo"].fillna("")
players_clean["total_games"] = players_clean["id"].map(games_count).fillna(0).astype(int)
players_clean["highest_market_value"] = players_clean["highest_market_value"].fillna(0).astype(int)
players_clean["height_in_cm"] = players_clean["height_in_cm"].fillna(0).astype(int)

print("[3/4] Processando conexões entre jogadores (mesma partida e mesmo time)...")
merged = appearances_df.merge(games_df[["game_id", "season"]], on="game_id", how="left")

connections = defaultdict(lambda: {"count": 0, "club_id": None, "last_season": 0})
grouped = merged.groupby(["game_id", "player_club_id"])

for (game_id, club_id), group in grouped:
    p_ids = group["player_id"].dropna().unique()
    if len(p_ids) < 2:
        continue
    
    season = group["season"].iloc[0] if pd.notnull(group["season"].iloc[0]) else 2020
    
    for p1, p2 in itertools.combinations(p_ids, 2):
        p1_int, p2_int = int(p1), int(p2)
        pair = (min(p1_int, p2_int), max(p1_int, p2_int))
        connections[pair]["count"] += 1
        if season >= connections[pair]["last_season"]:
            connections[pair]["last_season"] = int(season)
            connections[pair]["club_id"] = club_id

print(f"Total de conexoes unicas geradas: {len(connections)}")

print("[4/4] Gravando no banco de dados SQLite (prisma/eloperdido.db)...")
os.makedirs("prisma", exist_ok=True)
db_file = os.path.join("prisma", "eloperdido.db")

if os.path.exists(db_file):
    try:
        os.remove(db_file)
    except Exception:
        pass

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# Drop existing tables to enforce fresh schema with market value
cursor.execute("DROP TABLE IF EXISTS players")
cursor.execute("DROP TABLE IF EXISTS connections")
cursor.execute("DROP TABLE IF EXISTS daily_challenges")

cursor.execute("""
CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    search_name TEXT NOT NULL,
    country TEXT,
    current_team TEXT,
    photo TEXT,
    total_games INTEGER DEFAULT 0,
    highest_market_value INTEGER DEFAULT 0,
    height_in_cm INTEGER DEFAULT 0
)
""")
cursor.execute("CREATE INDEX idx_players_search ON players(search_name)")
cursor.execute("CREATE INDEX idx_players_games ON players(total_games)")
cursor.execute("CREATE INDEX idx_players_market_val ON players(highest_market_value)")

cursor.execute("""
CREATE TABLE connections (
    player_a_id INTEGER NOT NULL,
    player_b_id INTEGER NOT NULL,
    team_name TEXT,
    last_year INTEGER,
    shared_games INTEGER,
    PRIMARY KEY (player_a_id, player_b_id)
)
""")
cursor.execute("CREATE INDEX idx_conn_a ON connections(player_a_id)")
cursor.execute("CREATE INDEX idx_conn_b ON connections(player_b_id)")

cursor.execute("""
CREATE TABLE daily_challenges (
    id TEXT PRIMARY KEY,
    date TEXT UNIQUE NOT NULL,
    start_player_id INTEGER NOT NULL,
    target_player_id INTEGER NOT NULL,
    min_degrees INTEGER DEFAULT 4
)
""")

players_clean.to_sql("players", conn, if_exists="append", index=False)

conn_rows = []
for (p1, p2), data in connections.items():
    team_name = club_map.get(data["club_id"], "Clube Profissional")
    conn_rows.append((p1, p2, team_name, int(data["last_season"]), data["count"]))

cursor.executemany("""
INSERT INTO connections (player_a_id, player_b_id, team_name, last_year, shared_games)
VALUES (?, ?, ?, ?, ?)
""", conn_rows)

print("Criando Desafio Diario inicial...")

start_id = 28003  # Lionel Messi
target_id = 371998 # Vinicius Junior (Real Madrid)

today = "2026-08-17"
cursor.execute("""
INSERT OR REPLACE INTO daily_challenges (id, date, start_player_id, target_player_id, min_degrees)
VALUES (?, ?, ?, ?, ?)
""", ("dc_1", today, start_id, target_id, 4))

conn.commit()
conn.close()

try:
    shutil.copyfile(db_file, "eloperdido.db")
except Exception:
    pass

print("SUCESSO: Banco de dados 'prisma/eloperdido.db' gerado com exito!")
