import Database from "better-sqlite3";
import { app } from "electron";
import { isDev } from "../utils";
import path from "path";

export interface TransactionRaw {
  id: number;
  date: Date;
}

export interface TransactionItemRaw {
  id: number;
  transaction_id: number;
  product_id: number;
  product_price: number;
  product_quantity: number;
}

export interface ProductRaw {
  id: number;
  code: string;
  name: string;
  price: number;
}

export interface Transaction {
  id: number;
  date: Date;
  items: TransactionItem[];
  total: number;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
}

/*
Notes:
 [ ] Consider doing soft delete instead of hard delete.
 [x] Consider using foreign key constraints to maintain data integrity.
 [ ] Consider the implication of removing a 'transaction' to the balance calculation.
 [ ] Consider doing pagination.
 [ ] Consider adding audit table feature.

[x] means yes, [-] means no, [ ] means undecided.
*/
const DATABASE_PATH = path.join(app.getPath("appData"), isDev() ? "dev.db" : "data.db");

const db = Database(DATABASE_PATH);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("wal_checkpoint(RESTART)");

const TABLE_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS 'transaction' (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date INTEGER NOT NULL
    );
    `,
  `
    CREATE TABLE IF NOT EXISTS product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price INTEGER NOT NULL
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS transaction_item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_price INTEGER NOT NULL,
        product_quantity INTEGER NOT NULL,

        FOREIGN KEY(transaction_id) REFERENCES 'transaction'(id)
          ON UPDATE RESTRICT
          ON DELETE CASCADE

        FOREIGN KEY(product_id) REFERENCES product(id)
          ON UPDATE NO ACTION
          ON DELETE RESTRICT
    );
  `,
];

db.transaction((statements: string[]) => {
  statements.forEach((statement) => {
    db.prepare(statement).run();
  });
}).immediate(TABLE_STATEMENTS);

//// Get All Transactions
const GetTransactionsStatement = db.prepare("SELECT * FROM 'transaction'");
const GetTransactionItemsStatement = db.prepare("SELECT * FROM transaction_item");
const GetProductsStatement = db.prepare("SELECT * FROM product");

export function getTransactions(): Transaction[] {
  const allTransactionsRaw = GetTransactionsStatement.all() as TransactionRaw[];
  const allTransactionItemsRaw = GetTransactionItemsStatement.all() as TransactionItemRaw[];
  const allProductsRaw = GetProductsStatement.all() as ProductRaw[];

  const allTransactionItems: TransactionItem[] = allTransactionItemsRaw.map((ti) => {
    const product = allProductsRaw.find((p) => p.id === ti.product_id);

    return {
      id: ti.id,
      transaction_id: ti.transaction_id,
      quantity: ti.product_quantity,
      subtotal: ti.product_quantity * ti.product_price,
      product: {
        id: ti.product_id,
        code: product.code,
        name: product.name,
        price: ti.product_price,
      },
    };
  });

  const allTransactions: Transaction[] = allTransactionsRaw.map((t) => {
    const transactionItems: TransactionItem[] = allTransactionItems.filter(
      (ti) => ti.transaction_id === t.id
    );

    const total = transactionItems.reduce((acc, val) => acc + val.subtotal, 0);

    return {
      id: t.id,
      date: t.date,
      items: transactionItems,
      total: total,
    };
  });

  return allTransactions;
}

//// Add Transaction
const GetProductByIdStatement = db.prepare<{ id: number }>("SELECT * FROM product WHERE id = @id");

export type TransactionNew = Omit<TransactionRaw, "id">;
const InsertTransactionStatement = db.prepare<TransactionNew>(
  "INSERT INTO 'transaction' (date) VALUES (@date)"
);

export type TransactionItemNewRaw = Omit<TransactionItemRaw, "id">;
const InsertTransactionItemStatement = db.prepare<TransactionItemNewRaw>(
  `INSERT INTO transaction_item (transaction_id, product_id, product_quantity, product_price)
     VALUES (@transaction_id, @product_id, @product_quantity, @product_price)`
);

export type TransactionItemNew = Omit<TransactionItemNewRaw, "transaction_id" | "product_price">;

export const addTransaction = db.transaction((date: Date, items: TransactionItemNew[]) => {
  const result = InsertTransactionStatement.run({ date });

  items.forEach((item) => {
    const product = GetProductByIdStatement.get({ id: item.product_id }) as ProductRaw;

    InsertTransactionItemStatement.run({
      transaction_id: result.lastInsertRowid as number,
      product_price: product.price,
      product_id: item.product_id,
      product_quantity: item.product_quantity,
    });
  });
});

//// Remove Transaction

//// Get All Products
export function getProducts() {
  return GetProductsStatement.all();
}

//// Add Product
export type ProductNew = Omit<ProductRaw, "id">;
const InsertProductStatement = db.prepare<ProductNew>(
  "INSERT INTO product (code, name, price) VALUES (@code, @name, @price)"
);

export function addProduct(product: ProductNew) {
  InsertProductStatement.run(product);
}

//// Delete Product
const HardDeleteProductStatement = db.prepare<{ id: number }>("DELETE FROM product WHERE id = @id");

export function removeProduct(id: number) {
  HardDeleteProductStatement.run({ id });
}

//// Update Product
const UpdateProductStatement = db.prepare<ProductRaw>(
  "UPDATE product SET code = @code, name = @name, price = @price WHERE id = @id"
);

export function updateProduct(product: ProductRaw) {
  UpdateProductStatement.run(product);
}