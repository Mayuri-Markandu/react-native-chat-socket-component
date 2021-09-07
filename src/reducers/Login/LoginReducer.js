import { USERID, LOGIN_SUCCESS, LOGIN_FAILURE } from "lib/networking/Types";

const INITIAL_STATE = {
  loginSuccess: [],
  loginFailure: [],
  loginId: "",
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case USERID:
    return {
        ...state,
        loginId: action.payload
        
    }
      case LOGIN_SUCCESS: 
      return {
        ...state,
        loginSuccess: action.payload,
        loginFailure: [],
        verifySuccess: [],
        verifyFailure: [],
      }
      case LOGIN_FAILURE:
        return {
          ...state,
          loginFailure: action.payload,
          loginSuccess: [],
          verifySuccess: [],
          verifyFailure: [],
        }

    default:
      return state;
  }
};
