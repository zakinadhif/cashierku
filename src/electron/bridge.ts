import { ipcRenderer } from "electron";

import type { BridgeChannels } from "./api";

export const APIBridge: BridgeChannels = {
    getTransactions: () => ipcRenderer.invoke("getTransactions"),
    addTransaction: (date, items) => ipcRenderer.invoke("addTransaction", date, items),
    getProducts: () => ipcRenderer.invoke("getProducts"),
    addProduct: (product) => ipcRenderer.invoke("addProduct", product),
    updateProduct: (product) => ipcRenderer.invoke("updateProduct", product),
    removeProduct: (id) => ipcRenderer.invoke("removeProduct", id),
}
