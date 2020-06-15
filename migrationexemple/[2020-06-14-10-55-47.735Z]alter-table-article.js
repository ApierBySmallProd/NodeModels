const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const alter = migration.alterTable('article');

   alter.addField('category_id', 'bigint').foreign('category', 'id');
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('article');
};

module.exports = {
   name: 'alter-table-article-11',
    up,
   down,
};