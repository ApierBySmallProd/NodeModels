const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const newTable = migration.createTable('article');

   newTable.addField('id', 'bigint').autoIncrement().primary();
   newTable.addField('title', 'varchar').length(50);
   newTable.addField('publishedAt', 'date');
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('article');
};

module.exports = {
   name: 'create-table-article-9',
    up,
   down,
};