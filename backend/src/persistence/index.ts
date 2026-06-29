import { SqliteRepository } from './SqliteRepository';
import { MysqlRepository } from './MysqlRepository';
import { ItemRepository } from '../domain/ItemRepository';


export async function createRepository(): Promise<ItemRepository> {
  let repository: ItemRepository;

  if (process.env.MYSQL_HOST) {
    repository = new MysqlRepository();
  } else {
    repository = new SqliteRepository();
  }

  if ('init' in repository) {
    await (repository as any).init();
  }

  return repository;
}