import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network'
import { lockingContractAddress } from "./keplr";

const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};


export const totalClaimableRebase = async (productId, address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "rebase": { "app_id": productId, "address": address, "denom": "uharbor" } });
    return await config;
}