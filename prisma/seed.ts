import { execSync } from "child_process";

async function main() {
  console.log("⚽ Executando pipeline ETL Python do Transfermarkt...");
  execSync("python scripts/build_database.py", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
