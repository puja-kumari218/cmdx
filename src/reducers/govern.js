import { SET_ALL_PROPOSAL,
     SET_CURRENT_PROPOSAL, 
     SET_PROPOSAL_UP_DATA, 
     SET_USER_VOTE, 
     SET_VOTE_COUNT,
     ALL_PROPOSALS_SET,
     PROPOSALS_SET,
     PROPOSAL_SET,
     PROPOSAL_TALLY_SET,
     PROPOSER_SET
   
     } from "../constants/govern";
import { combineReducers } from "redux";

const allProposal = (state = "", action) => {
    if (action.type === SET_ALL_PROPOSAL) {
        return action.value;
    }
    return state;
};
const currentProposal = (state = [], action) => {
    if (action.type === SET_CURRENT_PROPOSAL) {
        return action.value;
    }
    return state;
};
const proposalUpData = (state = "", action) => {
    if (action.type === SET_PROPOSAL_UP_DATA) {
        return action.value;
    }
    return state;
};
const userVote = (state = [], action) => {
    if (action.type === SET_USER_VOTE) {
        return action.value;
    }
    return state;
};
const voteCount = (state = 0, action) => {
    if (action.type === SET_VOTE_COUNT) {
        return action.value;
    }
    return state;
};


// Changes
const allProposals = (state = [], action) => {
    if (action.type === ALL_PROPOSALS_SET) {
      return action.list || [];
    }
  
    return state;
  };
  
  const proposals = (state = [], action) => {
    if (action.type === PROPOSALS_SET) {
      return action.list || [];
    }
  
    return state;
  };
  
  const proposalMap = (state = {}, action) => {
    if (action.type === PROPOSAL_SET) {
      return {
        ...state,
        [action?.value?.proposal_id]: action.value || {},
      };
    }
  
    return state;
  };
  
  const proposalTallyMap = (state = {}, action) => {
    if (action.type === PROPOSAL_TALLY_SET) {
      return {
        ...state,
        [action?.proposalId]: action.value || {},
      };
    }
  
    return state;
  };
  
  const proposerMap = (state = {}, action) => {
    if (action.type === PROPOSER_SET) {
      return {
        ...state,
        [action?.proposalId]: action.value || {},
      };
    }
  
    return state;
  };

// 
export default combineReducers({
    proposals,
    allProposals,
    proposalMap,
    proposerMap,
    proposalTallyMap,
    allProposal,
    currentProposal,
    proposalUpData,
    userVote,
    voteCount,
});