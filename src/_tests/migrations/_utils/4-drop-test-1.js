const Migration = require('../../..').Migration;

/**
 * @param {Migration} migration
 */
const up = (migration) => {
    migration.dropTable('articles');
};

/**
 * @param {Migration} migration
 */
const down = (migration) => {
    const newTable = migration.createTable('articles');

    newTable.addField('id', 'bigint').autoIncrement().primary();
    newTable.addField('title', 'varchar').length(50).unique();
    newTable.addField('likes', 'bigint').default(0);
    newTable.addField('nb_pages', 'int');
    newTable
        .addField('category_id', 'bigint')
        .foreign('categories', 'id')
        .allowNull();
};

module.exports = {
    name: 'test-drop-table-1',
    up,
    down,
};