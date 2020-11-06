const Migration = require('../../..').Migration;

/**
 * @param {Migration} migration
 */
const up = (migration) => {
    const seed = migration.seedTable('categories');
    seed.addRow().add('label', 'Cat#1');
    seed.addRow().add('label', 'Cat#2');
};

/**
 * @param {Migration} migration
 */
const down = (migration) => {
    const seed = migration.seedTable('categories');
    seed.clearTable();
};

module.exports = {
    name: 'test-seed-table-1',
    up,
    down,
};