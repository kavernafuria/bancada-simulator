import sqlite3
import os
import sys
import random
from collections import deque
from datetime import datetime, timedelta

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

major_clubs_keywords = [
    "flamengo", "corinthians", "palmeiras", "são paulo", "sao paulo", "santos", "vasco",
    "grêmio", "gremio", "internacional", "atlético mineiro", "atletico mineiro", "cruzeiro",
    "fluminense", "botafogo", "bahia", "fortaleza", "athletico paranaense", "curitiba",
    "real madrid", "barcelona", "manchester city", "liverpool", "paris saint-germain", "psg",
    "bayern", "juventus", "chelsea", "arsenal", "manchester united", "inter", "ac milan",
    "napoli", "roma", "tottenham", "dortmund", "atletico madrid", "benfica", "porto", "sporting",
    "al-hilal", "al-nassr", "inter miami", "boca juniors", "river plate"
]

db_paths = [
    os.path.join(os.path.dirname(__file__), "..", "prisma", "eloperdido.db"),
    os.path.join(os.path.dirname(__file__), "..", "eloperdido.db")
]

for db_path in db_paths:
    if not os.path.exists(db_path):
        continue

    print(f"\n⚙️ Atualizando banco de dados: {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add is_renowned column if not exists
    cursor.execute("PRAGMA table_info(players)")
    cols = [col[1] for col in cursor.fetchall()]
    if "is_renowned" not in cols:
        cursor.execute("ALTER TABLE players ADD COLUMN is_renowned INTEGER DEFAULT 0")
        conn.commit()

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_players_renowned ON players(is_renowned)")

    cursor.execute("SELECT id, current_team, photo, total_games, highest_market_value FROM players")
    players = cursor.fetchall()

    renowned_ids = []
    famous_endpoint_ids = []

    for p_id, team, photo, games, val in players:
        team_lower = (team or "").lower()
        has_valid_photo = bool(photo and photo.startswith("http") and "header/0" not in photo)
        is_major_club = any(k in team_lower for k in major_clubs_keywords)

        is_ren = 0
        if val >= 1_500_000:
            is_ren = 1
        elif games >= 30:
            is_ren = 1
        elif is_major_club and (games >= 12 or val >= 400_000 or has_valid_photo):
            is_ren = 1
        elif has_valid_photo and (val >= 300_000 or games >= 15):
            is_ren = 1

        if is_ren == 1:
            renowned_ids.append(p_id)
            if val >= 5_000_000 or games >= 40 or (is_major_club and val >= 2_000_000 and has_valid_photo):
                famous_endpoint_ids.append(p_id)

    # Bulk update is_renowned
    cursor.execute("UPDATE players SET is_renowned = 0")
    cursor.executemany("UPDATE players SET is_renowned = 1 WHERE id = ?", [(pid,) for pid in renowned_ids])
    conn.commit()

    print(f"✅ Notoriedade aplicada: {len(renowned_ids):,} renomados (de {len(players):,} total). Craques para pontas: {len(famous_endpoint_ids):,}.")

    # Build 100% renowned connections graph
    cursor.execute("""
        SELECT c.player_a_id, c.player_b_id
        FROM connections c
        JOIN players p1 ON c.player_a_id = p1.id
        JOIN players p2 ON c.player_b_id = p2.id
        WHERE c.shared_games >= 1
          AND p1.is_renowned = 1
          AND p2.is_renowned = 1
    """)

    graph = {}
    conn_count = 0
    for p_a, p_b in cursor.fetchall():
        if p_a not in graph: graph[p_a] = set()
        if p_b not in graph: graph[p_b] = set()
        graph[p_a].add(p_b)
        graph[p_b].add(p_a)
        conn_count += 1

    print(f"⚡ Grafo 100% renomado montado com {len(graph):,} jogadores e {conn_count:,} conexões renomadas.")

    def bfs_shortest_path(start_id, target_id, max_depth=6):
        if start_id == target_id: return 0
        if start_id not in graph or target_id not in graph: return None
        visited = {start_id}
        queue = deque([(start_id, 0)])
        while queue:
            curr, dist = queue.popleft()
            if dist >= max_depth: continue
            for nxt in graph.get(curr, []):
                if nxt == target_id: return dist + 1
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append((nxt, dist + 1))
        return None

    # Recreate daily_challenges table
    cursor.execute("DROP TABLE IF EXISTS daily_challenges")
    cursor.execute("""
        CREATE TABLE daily_challenges (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            round_number INTEGER NOT NULL DEFAULT 1,
            start_player_id INTEGER NOT NULL,
            target_player_id INTEGER NOT NULL,
            min_degrees INTEGER NOT NULL DEFAULT 3,
            UNIQUE(date, round_number)
        )
    """)
    conn.commit()

    start_date = datetime(2026, 8, 17)
    num_days = 180
    total_inserted = 0

    print(f"🚀 Gerando 3 Fases diárias de caminhos 100% renomados (2 a 5 elos) para {num_days} dias...")

    round_configs = [
        (1, [2, 3]),
        (2, [3, 4]),
        (3, [4, 5]),
    ]

    for day_idx in range(num_days):
        curr_date = start_date + timedelta(days=day_idx)
        date_str = curr_date.strftime("%Y-%m-%d")
        used_today_ids = set()

        for round_num, target_dists in round_configs:
            attempts = 0
            found = False

            while attempts < 400 and not found:
                attempts += 1
                p1 = random.choice(famous_endpoint_ids)
                p2 = random.choice(famous_endpoint_ids)

                if p1 == p2 or p1 in used_today_ids or p2 in used_today_ids:
                    continue

                dist = bfs_shortest_path(p1, p2, max_depth=6)

                if dist is not None and 2 <= dist <= 5 and dist in target_dists:
                    challenge_id = f"{date_str}-r{round_num}"
                    cursor.execute("""
                        INSERT INTO daily_challenges (id, date, round_number, start_player_id, target_player_id, min_degrees)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (challenge_id, date_str, round_num, p1, p2, dist))

                    used_today_ids.add(p1)
                    used_today_ids.add(p2)
                    found = True
                    total_inserted += 1

            if not found:
                attempts_fallback = 0
                while attempts_fallback < 200 and not found:
                    attempts_fallback += 1
                    p1 = random.choice(famous_endpoint_ids)
                    p2 = random.choice(famous_endpoint_ids)
                    if p1 == p2: continue
                    dist = bfs_shortest_path(p1, p2, max_depth=6)
                    if dist is not None and 2 <= dist <= 5:
                        challenge_id = f"{date_str}-r{round_num}"
                        cursor.execute("""
                            INSERT INTO daily_challenges (id, date, round_number, start_player_id, target_player_id, min_degrees)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, (challenge_id, date_str, round_num, p1, p2, dist))
                        used_today_ids.add(p1)
                        used_today_ids.add(p2)
                        found = True
                        total_inserted += 1

    conn.commit()
    conn.close()
    print(f"🎉 Desafios 100% renomados gerados com sucesso no banco {db_path} ({total_inserted} fases)!")
