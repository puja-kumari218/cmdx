import { SigningCosmWasmClient } from "cosmwasm";
import { decode } from "js-base64";
import { comdex } from '../config/network'
import { getAmount } from "../utils/coin";
import { KeplrWallet, airdropContractAddress } from "./keplr";

const customFees = {
    upload: {
        amount: [{ amount: "2000000", denom: "ucmdx" }],
        gas: "2000000",
    },
    init: {
        amount: [{ amount: "500000", denom: "ucmdx" }],
        gas: "500000",
    },
    exec: {
        amount: [{ amount: "500000", denom: "ucmdx" }],
        gas: "500000",
    },
    send: {
        amount: [{ amount: "80000", denom: "ucmdx" }],
        gas: "80000",
    },
}

export const transactionForClaimLiquidHarbor = async (address, chainId, callback) => {

    const httpUrl = comdex?.rpc;
    let walletAddress = address;
    const handleMsg = {
        "claim_liquid":
        {
            "chain_id": chainId,

        }
    };


    const [offlineSigner] = await KeplrWallet(comdex?.chainId);

    await SigningCosmWasmClient.connectWithSigner(
        httpUrl,
        offlineSigner)
        .then((client) => {
            client.signAndBroadcast(
                walletAddress,
                [{
                    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                    value: {
                        sender: walletAddress,
                        contract: airdropContractAddress,
                        msg: new TextEncoder().encode(JSON.stringify(handleMsg)),
                        funds: []
                    }
                }],
                customFees.exec,
            ).then((response) => {
                if (!response?.code) {
                    callback(null, response)

                }
                else {
                    console.log(response);
                    callback(response)

                }

            }).catch((err) => {
                console.log(err);
                callback(err)
            })
        }).catch((error) => {
            callback(error)
        });

}


export const transactionForClaimActivityMission = async (address, chainId, activity, callback) => {

    const httpUrl = comdex?.rpc;
    let walletAddress = address;
    const handleMsg = {
        "claim_activity":
        {
            "chain_id": chainId,
            "action": activity,
        }
    };

    const [offlineSigner] = await KeplrWallet(comdex?.chainId);

    await SigningCosmWasmClient.connectWithSigner(
        httpUrl,
        offlineSigner)
        .then((client) => {
            client.signAndBroadcast(
                walletAddress,
                [{
                    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                    value: {
                        sender: walletAddress,
                        contract: airdropContractAddress,
                        msg: new TextEncoder().encode(JSON.stringify(handleMsg)),
                        funds: []
                    }
                }],
                customFees.exec,
            ).then((response) => {
                if (!response?.code) {
                    callback(null, response)
                }
                else {
                    console.log(response);
                    callback(response)
                }

            }).catch((err) => {
                console.log(err);
                callback(err)
            })
        }).catch((error) => {
            callback(error)
        });

}

export const transactionForClaimAllActivityMission = async (address, chainId, callback) => {

    const httpUrl = comdex?.rpc;
    let walletAddress = address;
    const handleMsg = {
        "claim_activities":
        {
            "chain_id": chainId,
        }
    };

    const [offlineSigner] = await KeplrWallet(comdex?.chainId);

    await SigningCosmWasmClient.connectWithSigner(
        httpUrl,
        offlineSigner)
        .then((client) => {
            client.signAndBroadcast(
                walletAddress,
                [{
                    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                    value: {
                        sender: walletAddress,
                        contract: airdropContractAddress,
                        msg: new TextEncoder().encode(JSON.stringify(handleMsg)),
                        funds: []
                    }
                }],
                customFees.exec,
            ).then((response) => {
                if (!response?.code) {
                    callback(null, response)
                }
                else {
                    console.log(response);
                    callback(response)
                }

            }).catch((err) => {
                console.log(err);
                callback(err)
            })
        }).catch((error) => {
            callback(error)
        });

}