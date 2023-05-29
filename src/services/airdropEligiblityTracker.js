import { HARBOR_AIRDROP_API_URL } from "../constants/url";
import axios from "axios";

export const eligibilityCheckTracker = (chainId, address, callback) => {
    axios
        .post(`${HARBOR_AIRDROP_API_URL}/eligibility/checkers`, {
            comdex_address: chainId,
            eligible_address: address
        })
        .then((result) => {
            callback(null, result?.data);
        })
        .catch((error) => {
            callback(error?.message);
        });
};

export const airdropEligibleUserPostRew = (hash, chainId, callback) => {
    axios
        .post(`${HARBOR_AIRDROP_API_URL}/magic/transaction`, {
            tx_hash: hash,
            chain_id: chainId,
        })
        .then((result) => {
            callback(null, result?.data);
        })
        .catch((error) => {
            callback(error?.message);
        });
};