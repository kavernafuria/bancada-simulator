import sqlite3
import os
import sys
import random
from collections import deque
from datetime import datetime, timedelta

if sys.platform == "win32":
  sys.stdout.reconfigure(encoding="utf-8")

DB_PATH = os.path.join(
    os.path.dirname(__file__), "..", "prisma", "eloperdido.db"
)


def build_graph(conn):
  print("⚡ Carregando conexões no grafo em memória...")
  cursor = conn.cursor()
  cursor.execute(
      "SELECT player_a_id, player_b_id FROM connections WHERE shared_games >= 1"
  )

  graph = {}
  connection_counts = {}
  count = 0

  for p_a, p_b in cursor.fetchall():
    if p_a not in graph:
      graph[p_a] = set()
      connection_counts[p_a] = 0
    if p_b not in graph:
      graph[p_b] = set()
      connection_counts[p_b] = 0

    graph[p_a].add(p_b)
    graph[p_b].add(p_a)
    connection_counts[p_a] += 1
    connection_counts[p_b] += 1
    count += 1

  print(
      f"✅ Grafo construído com sucesso! Total de conexões: {count:,} em"
      f" {len(graph):,} jogadores."
  )
  return graph, connection_counts


def bfs_shortest_path(graph, start_id, target_id, max_depth=6):
  if start_id == target_id:
    return 0
  if start_id not in graph or target_id not in graph:
    return None

  visited = {start_id}
  queue = deque([(start_id, 0)])

  while queue:
    curr, dist = queue.popleft()
    if dist >= max_depth:
      continue

    for neighbor in graph.get(curr, []):
      if neighbor == target_id:
        return dist + 1
      if neighbor not in visited:
        visited.add(neighbor)
        queue.append((neighbor, dist + 1))

  return None


def setup_daily_challenges_table(conn):
  cursor = conn.cursor()
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
  print("✅ Tabela 'daily_challenges' recriada para o modo 3 Fases com BFS.")


def generate_challenges():
  if not os.path.exists(DB_PATH):
    print(f"❌ Banco de dados não encontrado em {DB_PATH}")
    return

  conn = sqlite3.connect(DB_PATH)
  setup_daily_challenges_table(conn)

  graph, connection_counts = build_graph(conn)

  cursor = conn.cursor()
  cursor.execute(
      "SELECT id, name, total_games, highest_market_value FROM players WHERE"
      " photo IS NOT NULL AND photo LIKE 'http%' AND photo NOT LIKE"
      " '%header/0%'"
  )
  all_candidates = cursor.fetchall()

  # Filter famous/notable players for challenge endpoints
  famous_ids = []
  for p_id, name, games, val in all_candidates:
    conns = connection_counts.get(p_id, 0)
    if games >= 35 or val >= 8_000_000 or conns >= 35:
      famous_ids.append(p_id)

  print(
      f"🌟 Total de craques notórios/conhecidos elegíveis para pontas:"
      f" {len(famous_ids):,} jogadores."
  )

  start_date = datetime(2026, 8, 17)
  num_days = 180

  total_inserted = 0

  print(
      f"\n🚀 Gerando 3 Fases por dia (com limite de até 5 elos) para os"
      f" próximos {num_days} dias..."
  )

  for day_idx in range(num_days):
    curr_date = start_date + timedelta(days=day_idx)
    date_str = curr_date.strftime("%Y-%m-%d")

    used_today_ids = set()

    # Targets for 3 rounds (max distance <= 5):
    # Round 1 (Aquecimento): distance 2 or 3
    # Round 2 (Médio): distance 3 or 4
    # Round 3 (Desafio do Dia): distance 4 or 5
    round_configs = [
        (1, [2, 3]),
        (2, [3, 4]),
        (3, [4, 5]),
    ]

    for round_num, target_dists in round_configs:
      attempts = 0
      found = False

      while attempts < 400 and not found:
        attempts += 1
        p1 = random.choice(famous_ids)
        p2 = random.choice(famous_ids)

        if p1 == p2 or p1 in used_today_ids or p2 in used_today_ids:
          continue

        dist = bfs_shortest_path(graph, p1, p2, max_depth=6)

        # Enforce max 5 links limit
        if dist is not None and 2 <= dist <= 5 and dist in target_dists:
          challenge_id = f"{date_str}-r{round_num}"
          cursor.execute(
              """
                        INSERT INTO daily_challenges (id, date, round_number, start_player_id, target_player_id, min_degrees)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """,
              (challenge_id, date_str, round_num, p1, p2, dist),
          )

          used_today_ids.add(p1)
          used_today_ids.add(p2)
          found = True
          total_inserted += 1

      if not found:
        # Fallback within 2 to 5 range
        attempts_fallback = 0
        while attempts_fallback < 200 and not found:
          attempts_fallback += 1
          p1 = random.choice(famous_ids)
          p2 = random.choice(famous_ids)
          if p1 == p2:
            continue
          dist = bfs_shortest_path(graph, p1, p2, max_depth=6)
          if dist is not None and 2 <= dist <= 5:
            challenge_id = f"{date_str}-r{round_num}"
            cursor.execute(
                """
                            INSERT INTO daily_challenges (id, date, round_number, start_player_id, target_player_id, min_degrees)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """,
                (challenge_id, date_str, round_num, p1, p2, dist),
            )
            used_today_ids.add(p1)
            used_today_ids.add(p2)
            found = True
            total_inserted += 1

    if (day_idx + 1) % 30 == 0 or day_idx == 0:
      print(
          f"📅 Concluído até {date_str} ({day_idx + 1}/{num_days} dias"
          " processados)."
      )

  conn.commit()
  conn.close()

  print(
      f"\n🎉 SUCESSO! Total de {total_inserted} desafios gerados (3 Fases/dia com"
      f" até 5 elos para {num_days} dias)."
  )


if __name__ == "__main__":
  generate_challenges()
