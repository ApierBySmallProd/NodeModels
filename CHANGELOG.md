# Changelog

## V4.4.7

### FIX

- Error on association insertion

## V4.4.6

### ADD

- Join in FindQuery
- Group by and having in FindQuery

---

## V4.4.5

### ADD

- Express middleware to handle contexts

---

## V4.4.4

### ADD

- Access to queries
  - FinqQuery
  - UpdateQuery
  - CreateQuery
  - DeleteQuery

### FIX

- Modules import (now you don't have have to add modules for all dbms)

---

## V4.4.3

### FIX

- Modules import (now you don't have have to add modules for all dbms) (NOT WORKING SEE V4.4.4)

---

## V4.4.2

### ADD

- Support for Oracle Db
- Support for MSSql

## V4.4.1

### ADD

- Context notion

---

## V4.3.2

### FIX

- Limit and offset for MariaDb/Mysql and Postgres

---

## V4.3.1

### FIX

- Dist folder

---

## V4.3.0

### ADD

- Relations between entities
- Date management

### FIX

- Down migration trouble

---

## V4.2.0

### ADD

- Auto create and update from entities
  - Decorators
    - @AutoCreateNUpdate for Entity classes
    - Field types
      - @TinyInt
      - @Bool
      - @SmallInt
      - @MediumInt
      - @Int
      - @BigInt
      - @Decimal
      - @Float
      - @Double
      - @Bit
      - @Date
      - @Time
      - @DateTime
      - @Timestamp
      - @Year
      - @Char
      - @Varchar(size)
      - @Binary
      - @VarBinary
      - @TinyBlob
      - @Blob
      - @MediumBlob
      - @LongBlob
      - @TinyText
      - @Text
      - @LongText
    - Field property
      - @Unique
      - @AllowNull
      - @AutoIncrement
      - @PrimaryKey
      - @Default(value, isSystem)
      - @Check(value)

---

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
