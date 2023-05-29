import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network'
import { lockingContractAddress } from "./keplr";

const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};

export const vestingCreateWeightage = async () => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "state": {} });
    return await config;
}

export const vestingIssuedTokens = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "issued_vtokens": { "denom": "uharbor", "address": address, "start_after": 0, "limit": 300 } });
    return await config;
}
export const vestingLockNFTId = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "issued_nft": { "address": address } });
    return await config;
}
export const withdrawableHarbor = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "withdrawable": { "denom": "uharbor", "address": address } });
    return await config;
}