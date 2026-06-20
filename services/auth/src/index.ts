import { MysqlAuthRepository } from "./infrastructure/db/MysqlAuthRepository";
import { startAuthServer } from "./infrastructure/http/server";

async function main() {
  const repo = new MysqlAuthRepository();
  await repo.init();
  startAuthServer(repo, Number(process.env.PORT || 3001));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});