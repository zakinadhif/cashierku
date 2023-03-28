import {
  getTransactions,
  addTransaction,
  getProducts,
  addProduct,
  updateProduct,
  removeProduct,
} from "./database";

export const TwoWayAPI = {
  getTransactions,
  addTransaction,
  getProducts,
  addProduct,
  updateProduct,
  removeProduct,
};

export const OneWayAPI = {};

type Awaitable<T> = Promise<T> | T;

export type BridgeChannels = {
  [Channel in keyof typeof TwoWayAPI]: (
    ...args: Parameters<typeof TwoWayAPI[Channel]>
  ) => Awaitable<ReturnType<typeof TwoWayAPI[Channel]>>;
} & {
  [Channel in keyof typeof OneWayAPI]: (...args: Parameters<typeof OneWayAPI[Channel]>) => void;
};
