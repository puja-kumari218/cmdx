import Auctions from "./containers/Auctions";
import Dashboard from "./containers/Dashboard";
import Earn from "./containers/Earn";
import BorrowTab from "./containers/Mint";
import Vault from "./containers/Mint/Vault";
import StableMint from "./containers/StableMint/stablemint";
import MyPositions from "./containers/MyPosition";
import Assets from "./containers/Assets";
import More from './containers/More'
import Govern from './containers/More/Govern'
import GovernDetails from './containers/More/Govern/Details'
import Airdrop from "./containers/More/Airdrop";
import CompleteMission from './containers/More/Airdrop/CompleteMission';
import Vesting from "./containers/More/Locker";
import Vote from "./containers/More/Vote";
import StableMintVault from "./containers/StableMint/vault";
import Rewards from "./containers/More/Rewards";
import Swap from "./containers/Swap";
import Farm from "./containers/Farm";
import FarmDetails from "./containers/Farm/Details";
import Balances from "./containers/MyHome";


const routes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/my-positions",
    element: <MyPositions />,
  },
  {
    path: "/assets",
    element: <Assets />,
  },
  {
    path: "/stableMint",
    element: <StableMint />,
  },
  {
    path: "/stableMint/:pathVaultId",
    element: <StableMintVault />,
  },
  {
    path: "/mint",
    element: <BorrowTab />,
  },
  {
    path: "mint/vault/:pathVaultId",
    element: <Vault />,
  },
  {
    path: "/auctions",
    element: <Auctions />,
  },


  {
    path: "/govern",
    element: <Govern />,
  },
  {
    path: "/govern/govern-details/:proposalId",
    element: <GovernDetails />,
  },




  {
    path: "/trade",
    element: <Swap />,
  },

  {
    path: "/farm",
    element: <Farm />,
  },
    
  {
    path: "/farm/:id",
    element: <FarmDetails />,
  },
  {
    path: "/portfolio",
    element: <Balances />,
  },
  {
    path: "/more",
    element: <More />,
  },
  {
    path: "/more/earn",
    element: <Earn />,
  },
  {
    path: "/more/vesting",
    element: <Vesting />,
  },
  {
    path: "/more/vote",
    element: <Vote />,
  },





  {
    path: "/more/rewards",
    element: <Rewards />,
  },


  // {
  //   path: "/more/airdrop",
  //   element: <Airdrop />,
  // },
  // {
  //   path: "/more/airdrop/complete-mission/:chainId",
  //   element: <CompleteMission />,
  // },
];

export default routes;
