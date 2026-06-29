import { MysqlTaskRepository } from "./infrastructure/db/MysqlTaskRepository";
import { RabbitPublisher } from "./infrastructure/messaging/RabbitPublisher";
import { RabbitConsumer } from "./infrastructure/messaging/RabbitConsumer";
import { startTaskServer } from "./infrastructure/http/server";
//eeeee
async function main() {
  const repo = new MysqlTaskRepository();
  await repo.init();

  const publisher = new RabbitPublisher();
  await publisher.init();

  const consumer = new RabbitConsumer(repo);
  await consumer.init();

  startTaskServer(repo, publisher, Number(process.env.PORT || 3002));
}
//
main().catch((e) => {
  console.error(e);
  process.exit(1);
});