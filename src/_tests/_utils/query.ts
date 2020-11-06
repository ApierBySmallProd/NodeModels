import { GlobalModel } from '../..';

export default {
  create: async (model: GlobalModel, type: string) => {
    switch (type) {
      case 'postgres':
        await model.query(
          `CREATE TABLE categories (id SERIAL PRIMARY KEY NOT NULL, label VARCHAR(50));`,
        );
        await model.query(
          `CREATE TABLE articles (id SERIAL PRIMARY KEY NOT NULL, title VARCHAR(50), publishedat DATE, nbpages INT, category_id BIGINT, CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id));`,
        );
        await model.query(
          `CREATE TABLE users (id SERIAL PRIMARY KEY NOT NULL, firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50) UNIQUE, birthdate DATE)`,
        );
        await model.query(
          `CREATE TABLE article_authors (article_id BIGINT, user_id BIGINT, CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES articles(id), CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id))`,
        );
        break;
      case 'mysql':
        await model.query(
          `CREATE TABLE categories (id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT, label VARCHAR(50));`,
        );
        await model.query(
          `CREATE TABLE articles (id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT, title VARCHAR(50), publishedAt DATE, nbpages INT, category_id BIGINT, CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id));`,
        );
        await model.query(
          `CREATE TABLE users (id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50) UNIQUE, birthdate DATE)`,
        );
        await model.query(
          `CREATE TABLE article_authors (article_id BIGINT, user_id BIGINT, CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES articles(id), CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id))`,
        );
        break;
      case 'maria':
        await model.query(
          `CREATE TABLE categories (id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT, label VARCHAR(50));`,
        );
        await model.query(
          `CREATE TABLE articles (id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT, title VARCHAR(50), publishedAt DATE, nbpages INT, category_id BIGINT, CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id));`,
        );
        await model.query(
          `CREATE TABLE users (id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50) UNIQUE, birthdate DATE)`,
        );
        await model.query(
          `CREATE TABLE article_authors (article_id BIGINT, user_id BIGINT, CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES articles(id), CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id))`,
        );
        break;
      default:
    }
  },
  delete: async (model: GlobalModel) => {
    await model.query('DROP TABLE article_authors');
    await model.query('DROP TABLE articles');
    await model.query('DROP TABLE categories');
    await model.query('DROP TABLE users');
  },
};
