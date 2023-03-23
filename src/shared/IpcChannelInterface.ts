import { IpcMainEvent, IpcMainInvokeEvent } from "electron";

export interface IpcChannelInterface {
    name: string;
    handle(event: IpcMainEvent, request: any): void;
}

export interface IpcInvokeChannelInterface {
    name: string;
    handle(event: IpcMainInvokeEvent, request: any): Promise<any>;
}