export const customAminoTypes = {
  "/comdex.vault.v1beta1.MsgCreateRequest": {
    aminoType: "comdex/vault/MsgCreateRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      amountIn,
      amountOut,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        amount_in: amountIn,
        amount_out: amountOut,
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      amount_in,
      amount_out,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        amountIn: amount_in,
        amountOut: amount_out,
      };
    },
  },
  "/comdex.vault.v1beta1.MsgDepositRequest": {
    aminoType: "comdex/vault/MsgDepositRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      userVaultId,
      amount,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        user_vault_id: String(userVaultId),
        amount: amount,
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      user_vault_id,
      amount,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        userVaultId: Number(user_vault_id),
        amount: amount,
      };
    },
  },
  "/comdex.vault.v1beta1.MsgWithdrawRequest": {
    aminoType: "comdex/vault/MsgWithdrawRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      userVaultId,
      amount,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        user_vault_id: String(userVaultId),
        amount: amount,
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      user_vault_id,
      amount,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        userVaultId: Number(user_vault_id),
        amount: amount,
      };
    },
  },
  "/comdex.vault.v1beta1.MsgDrawRequest": {
    aminoType: "comdex/vault/MsgDrawRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      userVaultId,
      amount,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        user_vault_id: String(userVaultId),
        amount: amount,
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      user_vault_id,
      amount,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        userVaultId: Number(user_vault_id),
        amount: amount,
      };
    },
  },
  "/comdex.vault.v1beta1.MsgRepayRequest": {
    aminoType: "comdex/vault/MsgRepayRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      userVaultId,
      amount,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        user_vault_id: String(userVaultId),
        amount: amount,
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      user_vault_id,
      amount,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        userVaultId: Number(user_vault_id),
        amount: amount,
      };
    },
  },

  "/comdex.vault.v1beta1.MsgCloseRequest": {
    aminoType: "comdex/vault/MsgCloseRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      userVaultId,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        user_vault_id: String(userVaultId),
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      user_vault_id,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        userVaultId: Number(user_vault_id),
      };
    },
  },
  "/comdex.locker.v1beta1.MsgCreateLockerRequest": {
    aminoType: "comdex/locker/MsgCreateLockerRequest",
    toAmino: ({
      depositor,
      amount,
      assetId,
      appId,
    }) => {
      return {
        depositor,
        amount: amount,
        asset_id: String(assetId),
        app_id: String(appId),
      };
    },
    fromAmino: ({
      depositor,
      amount,
      asset_id,
      app_id,

    }) => {
      return {
        depositor,
        amount: amount,
        assetId: Number(asset_id),
        appId: Number(app_id),

      };
    },
  },
  "/comdex.locker.v1beta1.MsgAddWhiteListedAssetRequest": {
    aminoType: "comdex/locker/MsgAddWhiteListedAssetRequest",
    toAmino: ({
      from,
      assetId,
      appMappingId,
    }) => {
      return {
        from,
        asset_id: String(assetId),
        app_mapping_id: String(appMappingId),
      };
    },
    fromAmino: ({
      from,
      asset_id,
      app_mapping_id,

    }) => {
      return {
        from,
        assetId: Number(asset_id),
        appMappingId: Number(app_mapping_id),
      };
    },
  },
  "/comdex.locker.v1beta1.MsgDepositAssetRequest": {
    aminoType: "comdex/locker/MsgDepositAssetRequest",
    toAmino: ({
      depositor,
      lockerId,
      amount,
      assetId,
      appId,
    }) => {
      return {
        depositor,
        locker_id: String(lockerId),
        amount: amount,
        asset_id: String(assetId),
        app_id: String(appId),
      };
    },
    fromAmino: ({
      depositor,
      amount,
      locker_id,
      asset_id,
      app_id,

    }) => {
      return {
        depositor,
        lockerId: Number(locker_id),
        amount: amount,
        assetId: Number(asset_id),
        appId: Number(app_id),
      };
    },
  },
  "/comdex.locker.v1beta1.MsgWithdrawAssetRequest": {
    aminoType: "comdex/locker/MsgWithdrawAssetRequest",
    toAmino: ({
      depositor,
      lockerId,
      amount,
      assetId,
      appId,
    }) => {
      return {
        depositor,
        locker_id: String(lockerId),
        amount: amount,
        asset_id: String(assetId),
        app_id: String(appId),
      };
    },
    fromAmino: ({
      depositor,
      amount,
      locker_id,
      asset_id,
      app_id,

    }) => {
      return {
        depositor,
        lockerId: Number(locker_id),
        amount: amount,
        assetId: Number(asset_id),
        appId: Number(app_id),
      };
    },
  },
  "/comdex.auction.v1beta1.MsgPlaceSurplusBidRequest": {
    aminoType: "comdex/auction/MsgPlaceSurplusBidRequest",
    toAmino: ({
      bidder,
      amount,
      auctionId,
      appId,
      auctionMappingId,
    }) => {
      return {
        bidder,
        amount: amount,
        auction_id: String(auctionId),
        app_id: String(appId),
        auction_mapping_id: String(auctionMappingId),
      };
    },
    fromAmino: ({
      bidder,
      amount,
      auction_id,
      app_id,
      auction_mapping_id,
    }) => {
      return {
        bidder,
        amount: amount,
        auctionId: Number(auction_id),
        appId: Number(app_id),
        auctionMappingId: Number(auction_mapping_id),
      };
    },
  },
  "/comdex.auction.v1beta1.MsgPlaceDebtBidRequest": {
    aminoType: "comdex/auction/MsgPlaceDebtBidRequest",
    toAmino: ({
      bidder,
      bid,
      expectedUserToken,
      auctionId,
      appId,
      auctionMappingId,
    }) => {
      return {
        bidder,
        bid: bid,
        expected_user_token: expectedUserToken,
        auction_id: String(auctionId),
        app_id: String(appId),
        auction_mapping_id: String(auctionMappingId),
      };
    },
    fromAmino: ({
      bidder,
      bid,
      expected_user_token,
      auction_id,
      app_id,
      auction_mapping_id,
    }) => {
      return {
        bidder,
        bid: bid,
        expectedUserToken: expected_user_token,
        auctionId: Number(auction_id),
        appId: Number(app_id),
        auctionMappingId: Number(auction_mapping_id),
      };
    },
  },
  "/comdex.auction.v1beta1.MsgPlaceDutchBidRequest": {
    aminoType: "comdex/auction/MsgPlaceDutchBidRequest",
    toAmino: ({
      bidder,
      max,
      amount,
      auctionId,
      appId,
      auctionMappingId,
    }) => {
      return {
        bidder,
        max,
        amount: amount,
        auction_id: String(auctionId),
        app_id: String(appId),
        auction_mapping_id: String(auctionMappingId),
      };
    },
    fromAmino: ({
      bidder,
      max,
      amount,
      auction_id,
      app_id,
      auction_mapping_id,
    }) => {
      return {
        bidder,
        max,
        amount: amount,
        auctionId: Number(auction_id),
        appId: Number(app_id),
        auctionMappingId: Number(auction_mapping_id),
      };
    },
  },
  "/comdex.locker.v1beta1.MsgCloseLockerRequest": {
    aminoType: "comdex/locker/MsgCloseLockerRequest",
    toAmino: ({
      depositor,
      appId,
      assetId,
      lockerId,
    }) => {
      return {
        depositor,
        app_id: String(appId),
        asset_id: String(assetId),
        locker_id: String(lockerId),
      };
    },
    fromAmino: ({
      depositor,
      app_id,
      asset_id,
      locker_id,
    }) => {
      return {
        depositor,
        appId: Number(app_id),
        assetId: Number(asset_id),
        lockerId: Number(locker_id),
      };
    },
  },
  "/comdex.locker.v1beta1.MsgLockerRewardCalcRequest": {
    aminoType: "comdex/locker/MsgLockerRewardCalcRequest",
    toAmino: ({
      from,
      appId,
      lockerId,
    }) => {
      return {
        from,
        app_id: String(appId),
        locker_id: String(lockerId),
      };
    },
    fromAmino: ({
      from,
      app_id,
      locker_id,
    }) => {
      return {
        from,
        appId: Number(app_id),
        lockerId: Number(locker_id),
      };
    },
  },
  "/comdex.vault.v1beta1.MsgDepositAndDrawRequest": {
    aminoType: "comdex/vault/MsgDepositAndDrawRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      userVaultId,
      amount,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        user_vault_id: String(userVaultId),
        amount: amount
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      user_vault_id,
      amount
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        userVaultId: Number(user_vault_id),
        amount: amount
      };
    },
  },
  "/comdex.vault.v1beta1.MsgVaultInterestCalcRequest": {
    aminoType: "comdex/vault/MsgVaultInterestCalcRequest",
    toAmino: ({
      from,
      appId,
      userVaultId,
    }) => {
      return {
        from,
        app_id: String(appId),
        user_vault_id: String(userVaultId),
      };
    },
    fromAmino: ({
      from,
      app_id,
      user_vault_id,
    }) => {
      return {
        from,
        appId: Number(app_id),
        userVaultId: Number(user_vault_id),
      };
    },
  },

  "/comdex.vault.v1beta1.MsgDepositStableMintRequest": {
    aminoType: "comdex/vault/MsgDepositStableMintRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      amount,
      stableVaultId,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        amount,
        stable_vault_id: String(stableVaultId),
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      amount,
      stable_vault_id,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        amount,
        stableVaultId: Number(stable_vault_id)
      };
    },
  },


  "/comdex.vault.v1beta1.MsgWithdrawStableMintRequest": {
    aminoType: "comdex/vault/MsgWithdrawStableMintRequest",
    toAmino: ({
      from,
      appId,
      extendedPairVaultId,
      amount,
      stableVaultId,
    }) => {
      return {
        from,
        app_id: String(appId),
        extended_pair_vault_id: String(extendedPairVaultId),
        amount,
        stable_vault_id: String(stableVaultId),
      };
    },
    fromAmino: ({
      from,
      app_id,
      extended_pair_vault_id,
      amount,
      stable_vault_id,
    }) => {
      return {
        from,
        appId: Number(app_id),
        extendedPairVaultId: Number(extended_pair_vault_id),
        amount,
        stableVaultId: Number(stable_vault_id)
      };
    },
  },

  "/cosmos.bank.v1beta1.MsgSend": {
    aminoType: "cosmos-sdk/MsgSend",
    toAmino: ({
      fromAddress,
      toAddress,
      amount,
    }) => {
      return {
        from_address: fromAddress,
        to_address: toAddress,
        amount,
      };
    },
    fromAmino: ({
      from_address,
      to_address,
      amount,
    }) => {
      return {
        fromAddress: from_address,
        toAddress: to_address,
        amount,
      };
    },
  },
};



