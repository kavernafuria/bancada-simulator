import sqlite3
import urllib.parse
import urllib.request
import json
import time
import os
import sys

if sys.platform == "win32":
  sys.stdout.reconfigure(encoding="utf-8")

DB_PATH = os.path.join(
    os.path.dirname(__file__), "..", "prisma", "eloperdido.db"
)


def enrich_photos():
  if not os.path.exists(DB_PATH):
    print(f"❌ Banco de dados não encontrado em: {DB_PATH}")
    return

  conn = sqlite3.connect(DB_PATH)
  cursor = conn.cursor()

  # Ensure connections_count index/column or order by total_games
  cursor.execute("""
        SELECT id, name FROM players 
        WHERE (photo IS NULL OR photo = '' OR photo LIKE '%default%' OR photo LIKE '%header/0%')
        ORDER BY total_games DESC, highest_market_value DESC
        LIMIT 1000
    """)
  missing_players = cursor.fetchall()

  print(
      f"🔍 Encontrados {len(missing_players)} jogadores relevantes sem foto."
      " Buscando fotos na Wikipédia..."
  )

  headers = {"User-Agent": "KaversGamesBot/1.0 (contato@kaversgames.com.br)"}
  updated = 0

  for idx, (p_id, name) in enumerate(missing_players):
    try:
      # Try pt.wikipedia.org first
      encoded_name = urllib.parse.quote(name.replace(" ", "_"))
      url = f"https://pt.wikipedia.org/api/rest_v1/page/summary/{encoded_name}"

      req = urllib.request.Request(url, headers=headers)
      img_url = None

      try:
        with urllib.request.urlopen(req, timeout=4) as res:
          if res.status == 200:
            data = json.loads(res.read().decode("utf-8"))
            if "thumbnail" in data and "source" in data["thumbnail"]:
              img_url = data["thumbnail"]["source"]
      except Exception:
        pass

      # If not found on pt.wikipedia, try en.wikipedia.org
      if not img_url:
        url_en = (
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_name}"
        )
        req_en = urllib.request.Request(url_en, headers=headers)
        try:
          with urllib.request.urlopen(req_en, timeout=4) as res_en:
            if res_en.status == 200:
              data_en = json.loads(res_en.read().decode("utf-8"))
              if "thumbnail" in data_en and "source" in data_en["thumbnail"]:
                img_url = data_en["thumbnail"]["source"]
        except Exception:
          pass

      if img_url:
        cursor.execute(
            "UPDATE players SET photo = ? WHERE id = ?", (img_url, p_id)
        )
        updated += 1
        print(f"✅ [{updated}] Foto encontrada para: {name} -> {img_url}")

      time.sleep(0.08)  # Avoid rate limit
    except Exception as e:
      continue

    if (idx + 1) % 100 == 0:
      conn.commit()
      print(f"📌 {idx + 1}/{len(missing_players)} jogadores verificados...")

  conn.commit()
  conn.close()
  print(
      f"\n🎉 Processo concluído! {updated} novas fotos adicionadas ao banco de"
      " dados."
  )


if __name__ == "__main__":
  enrich_photos()
