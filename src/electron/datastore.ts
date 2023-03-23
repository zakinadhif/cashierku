import { IpcMainInvokeEvent } from "electron";

import { IpcInvokeChannelInterface } from "../shared/IpcChannelInterface";

export interface GetTransactionResponse {}
export interface CreateTransactionResponse {}
export interface DeleteTransactionResponse {}
export interface UpdateTransactionResponse {}

export interface GetTransactionRequest {
    type: "get_transaction"
}

export interface CreateTransactionRequest {
    type: "create_transaction"
}

export interface DeleteTransactionRequest {
    type: "delete_transaction"
}

export interface UpdateTransactionRequest {
    type: "update_transaction"
}

type TransactionDatastoreRequest =
    GetTransactionRequest
    | CreateTransactionRequest
    | DeleteTransactionRequest
    | UpdateTransactionRequest;

type TransactionDatastoreResponse =
    GetTransactionResponse
    | CreateTransactionResponse
    | DeleteTransactionResponse
    | UpdateTransactionResponse;

export class TransactionDatastore implements IpcInvokeChannelInterface {
    name: "datastore:transaction";

    public async handle(event: IpcMainInvokeEvent, request: GetTransactionRequest): Promise<GetTransactionResponse>;
    public async handle(event: IpcMainInvokeEvent, request: CreateTransactionRequest): Promise<CreateTransactionResponse>;
    public async handle(event: IpcMainInvokeEvent, request: DeleteTransactionRequest): Promise<DeleteTransactionResponse>;
    public async handle(event: IpcMainInvokeEvent, request: UpdateTransactionRequest): Promise<UpdateTransactionResponse>;
    public async handle(event: IpcMainInvokeEvent, request: TransactionDatastoreRequest): Promise<TransactionDatastoreResponse> {
        switch (request.type) {
            case "get_transaction": return this.get(request);
            case "create_transaction": return this.create(request);
            case "delete_transaction": return this.delete(request);
            case "update_transaction": return this.update(request);
        }
    }

    private get(request: GetTransactionRequest): GetTransactionResponse {
        return {};
    }

    private create(request: CreateTransactionRequest): CreateTransactionResponse {
        return {};
    }

    private delete(request: DeleteTransactionRequest): DeleteTransactionResponse {
        return {};
    }

    private update(request: UpdateTransactionRequest): UpdateTransactionResponse {
        return {}
    }
};