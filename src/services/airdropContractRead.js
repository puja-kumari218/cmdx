import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network';
import { airdropContractAddress } from "./keplr";

const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};

export const timeLeftToClaim = async () => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "end_time": {} });
    return await config;
}

export const totalStatsOFClaimedData = async () => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "stats": {} });
    return await config;
}

export const checkEligibility = async (address, chainId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "airdrop": { "address": address, "chain_id": chainId } });
    return await config;
}

export const checkTotalEligibility = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "total_eligible": { "address": address } });
    return await config;
}

export const claimHarbor = async (address, chainId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "harbor_claimed": { "address": address, "chain_id": chainId } });
    return await config;
}

export const claimveHarbor = async (address, chainId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "ve_harbor_claimed": { "address": address, "chain_id": chainId } });
    return await config;
}

export const unClaimHarbor = async (address, chainId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "un_claimed_harbor": { "address": address, "chain_id": chainId } });
    return await config;
}

export const unClaimveHarbor = async (address, chainId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "un_claimed_ve_harbor": { "address": address, "chain_id": chainId } });
    return await config;
}

export const airdropMissionMint = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "is_completed": { "address": address, "activity": "mint" } });
    return await config;
}

export const airdropMissionVote = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "is_completed": { "address": address, "activity": "vote" } });
    return await config;
}

export const airdropMissionLiquidity = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "is_completed": { "address": address, "activity": "liquidity" } });
    return await config;
}

export const airdropMissionBorrow = async (address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(airdropContractAddress, { "is_completed": { "address": address, "activity": "borrow" } });
    return await config;
}


