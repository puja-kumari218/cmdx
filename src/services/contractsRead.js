import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network'
import { contractAddress, lockingContractAddress } from "./keplr";

const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};


export const totalProposal = async (start, productId, limit, status) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(contractAddress, { "list_app_proposal": { "app_id": productId, "start_after": start, "limit": limit, "status": status } });
    return await config;
}

export const fetchAllProposalList = async () => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(contractAddress, { "list_proposals": {} });
    return await config;
}

export const fetchSpecificProposalData = async (proposalId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(contractAddress, { "proposal": { "proposal_id": proposalId } });
    return await config;
}
export const fetchProposalUpData = async (productId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(contractAddress, { "app_all_up_data": { "app_id": productId } });
    return await config;
}

export const fetchParticipationStats= async (productId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(contractAddress, { "participation_stats": { "app_id": productId } });
    return await config;
}
export const checkUserVote = async (proposalId, address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(contractAddress, { "vote": { "proposal_id": proposalId, "voter": address } });
    return await config;
}
export const totalveHarborSupply = async () => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "supply": { "denom": "uharbor" } });
    return await config;
}