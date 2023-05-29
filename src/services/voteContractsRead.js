import axios from "axios";
import { CosmWasmClient } from "cosmwasm";
import { comdex } from '../config/network'
import { HARBOR_ASSET_ID, PRODUCT_ID } from "../constants/common";
import { API_URL, EMISSION_API_URL } from "../constants/url";
import { lockingContractAddress } from "./keplr";


const configin = {
    chainId: comdex?.chainId,
    rpcEndpoint: comdex?.rpc,
    prefix: comdex?.prefix,
};

export const votingCurrentProposalId = async (productId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "current_proposal": { "app_id": productId } });
    return await config;
}
export const votingCurrentProposal = async (proposalId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "proposal": { "proposal_id": proposalId } });
    return await config;
}

export const votingTotalVotes = async (proposalId, extendedPairID) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "extended_pair_vote": { "proposal_id": proposalId, "extended_pair_id": extendedPairID } });
    return await config;
}

export const votingTotalBribs = async (proposalId, extendedPairID) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "bribe_by_proposal": { "proposal_id": proposalId, "extended_pair_id": extendedPairID } });
    return await config;
}

export const votingUserVote = async (proposalId, address) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "vote": { "proposal_id": proposalId, "address": address } });
    return await config;
}

export const totalVTokens = async (address, height) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "total_v_tokens": { "address": address, "denom": "uharbor", "height": height } });
    return await config;
}

export const userProposalAllUpData = async (address, proposalId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "user_proposal_all_up": { "address": address, "proposal_id": proposalId } });
    return await config;
}
export const userProposalAllUpPoolData = async (address, proposalId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "user_proposal_all_up_pool": { "address": address, "proposal_id": proposalId } });
    return await config;
}

export const userProposalProjectedEmission = async (proposalId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "projected_emission": { "proposal_id": proposalId, "app_id": PRODUCT_ID, "gov_token_denom": "uharbor", "gov_token_id": HARBOR_ASSET_ID } });
    return await config;
}

// New Query 

export const userCurrentProposal = async (address, productId) => {
    const client = await CosmWasmClient.connect(configin.rpcEndpoint);
    const config = await client.queryContractSmart(lockingContractAddress, { "current_proposal_user": { "address": address, "app_id": productId } });
    return await config;
}

export const emissiondata = (address, callback) => {
    axios
        .get(`${EMISSION_API_URL}/api/v2/harbor/emissions/${address}`)
        .then((result) => {
            callback(null, result?.data);
        })
        .catch((error) => {
            callback(error?.message);
        });
};