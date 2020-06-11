# Changelog

## V4.1.0

### ADD

- Config in **DbManager**
- Transactions
- Migration table

---

## V4.0.0

### ADD

- DbManager with the possibility to add and to get dbs (only Maria and Postgres)
- Entities
  - Entity class to give the user the possibility to create, update, delete and find some datas
  - Decorators
    - @Table with the name of the table for an entity class
    - @Id for an attribute of an entity
    - @PrimaryKey for an attribute of an entity
    - @NonPersistent for an attribute of an entity

---

## V3.1.0

### Refactor

- Better names and structure

---

## V3.0.0

### ADD

- Migration process
  - MigrationManager to use to initialize migrations
  - Migration class used for every migration file
  - MigrationTypes
    - CreateTable
    - AlterTable
    - DropTable
    - SeedTable

---

## V2.1.0

### ADD

- Support for Mariadb/Mysql

---

## V2.0.0

### FIX

- Postgres for node v14

### ADD

- Debug support with env variable DB_DEBUG or in constructor

---

## V1.0.0

### ADD

- Support for Postgres
