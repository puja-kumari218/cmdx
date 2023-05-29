import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network'
import { PRODUCT_ID } from "../constants/common";
import { lockingContractAddress } from "./keplr";

const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};

export const claimableRewards = async (productId, address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "claimable_bribe": { "app_id": productId, "address": address } });
    return await config;
}