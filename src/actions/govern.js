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
     }
        from "../constants/govern";

export const setAllProposal = (value) => {
    return {
        type: SET_ALL_PROPOSAL,
        value,
    };
};
export const setCurrentProposal = (value) => {
    return {
        type: SET_CURRENT_PROPOSAL,
        value,
    };
};
export const setProposalUpData = (value) => {
    return {
        type: SET_PROPOSAL_UP_DATA,
        value,
    };
};
export const setUserVote = (value) => {
    return {
        type: SET_USER_VOTE,
        value,
    };
};
export const setVoteCount = (value) => {
    return {
        type: SET_VOTE_COUNT,
        value,
    };
};

// change
export const setAllProposals = (list) => {
    return {
      type: ALL_PROPOSALS_SET,
      list,
    };
  };
  
  export const setProposals = (list) => {
    return {
      type: PROPOSALS_SET,
      list,
    };
  };
  
  export const setProposal = (value) => {
    return {
      type: PROPOSAL_SET,
      value,
    };
  };
  
  export const setProposalTally = (value, proposalId) => {
    return {
      type: PROPOSAL_TALLY_SET,
      proposalId,
      value,
    };
  };
  
  export const setProposer = (value, proposalId) => {
    return {
      type: PROPOSER_SET,
      proposalId,
      value,
    };
  };
  