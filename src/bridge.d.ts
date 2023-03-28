import type { BridgeChannels } from "./electron/api";

declare global {
    interface Window { api: BridgeChannels }
}