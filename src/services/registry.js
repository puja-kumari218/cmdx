import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { MsgPlaceDebtBidRequest, MsgPlaceDutchBidRequest, MsgPlaceSurplusBidRequest } from 'comdex-codec/build/comdex/auction/v1beta1/tx';
import { MsgCloseLockerRequest, MsgCreateLockerRequest, MsgDepositAssetRequest, MsgLockerRewardCalcRequest, MsgWithdrawAssetRequest } from 'comdex-codec/build/comdex/locker/v1beta1/tx';
import { MsgCloseRequest, MsgCreateRequest, MsgDepositAndDrawRequest, MsgDepositRequest, MsgDepositStableMintRequest, MsgDrawRequest, MsgRepayRequest, MsgVaultInterestCalcRequest, MsgWithdrawRequest, MsgWithdrawStableMintRequest } from 'comdex-codec/build/comdex/vault/v1beta1/tx';



export const myRegistry = new Registry([
  ...defaultRegistryTypes,
  ["/comdex.locker.v1beta1.MsgCreateLockerRequest", MsgCreateLockerRequest],
  ["/comdex.locker.v1beta1.MsgDepositAssetRequest", MsgDepositAssetRequest],
  ["/comdex.locker.v1beta1.MsgWithdrawAssetRequest", MsgWithdrawAssetRequest],
  ["/comdex.locker.v1beta1.MsgCloseLockerRequest", MsgCloseLockerRequest],
  ["/comdex.locker.v1beta1.MsgLockerRewardCalcRequest", MsgLockerRewardCalcRequest],
  ["/comdex.vault.v1beta1.MsgCreateRequest", MsgCreateRequest],
  ["/comdex.vault.v1beta1.MsgDepositRequest", MsgDepositRequest],
  ["/comdex.vault.v1beta1.MsgWithdrawRequest", MsgWithdrawRequest],
  ["/comdex.vault.v1beta1.MsgDrawRequest", MsgDrawRequest],
  ["/comdex.vault.v1beta1.MsgRepayRequest", MsgRepayRequest],
  ["/comdex.vault.v1beta1.MsgCloseRequest", MsgCloseRequest],
  ["/comdex.vault.v1beta1.MsgDepositAndDrawRequest", MsgDepositAndDrawRequest],
  ["/comdex.vault.v1beta1.MsgVaultInterestCalcRequest", MsgVaultInterestCalcRequest],
  ["/comdex.vault.v1beta1.MsgDepositStableMintRequest", MsgDepositStableMintRequest],
  ["/comdex.vault.v1beta1.MsgWithdrawStableMintRequest", MsgWithdrawStableMintRequest],
  ["/comdex.auction.v1beta1.MsgPlaceSurplusBidRequest", MsgPlaceSurplusBidRequest],
  ["/comdex.auction.v1beta1.MsgPlaceDebtBidRequest", MsgPlaceDebtBidRequest],
  ["/comdex.auction.v1beta1.MsgPlaceDutchBidRequest", MsgPlaceDutchBidRequest],

]);


