const Migration = require('../../..').Migration;

/**
 * @param {Migration} migration
 */
const up = (migration) => {
    const newTable = migration.createTable('articles');

    newTable.addField('id', 'bigint').autoIncrement().primary();
    newTable.addField('title', 'varchar').length(50).unique();
    newTable.addField('published_at', 'date').allowNull();
    newTable.addField('nb_pages', 'int');
    newTable
        .addField('category_id', 'bigint')
        .foreign('categories', 'id')
        .allowNull();
};

/**
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('articles');
};

module.exports = {
    name: 'test-create-table-2',
    up,
    down,
};