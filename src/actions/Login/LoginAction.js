import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  USERID,
  ROOMDETAILS
} from "./../../lib/networking/Types";
import { LOGIN  } from "./../../lib/networking/ApiConstants";
import { postAxios } from 'lib/networking/Api';

export const doLogin = (data) => {

  let url = LOGIN
    return dispatch => {
      let formData = new FormData();
      formData.append('username', data.username);
      // formData.append('device_id', 'password');
         formData.append('password', data.password);
         formData.append('traffic','chat')
      // formData.append('push_token', 'password')
      postAxios(url, formData, {} , () => {} , (resp) => {
        if((resp.status == 200)){
          console.log('response is ==========='+JSON.stringify(resp))
            dispatch({
                type: LOGIN_SUCCESS,
                payload: resp.data
            });
        }else{
            dispatch({
                type: LOGIN_FAILURE,
                payload: resp
            });
        }
    });
    }
  }


export const userId = (data) => {
  return dispatch => {
    dispatch({
        type: USERID,
        payload: data
    })
}
}

export const roomId = (data) => {
  return dispatch => {
    dispatch({
        type: ROOMDETAILS,
        payload: data
    })
}
}
