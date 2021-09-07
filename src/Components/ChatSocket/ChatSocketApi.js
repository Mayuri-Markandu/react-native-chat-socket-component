import axios from "axios";
import { CHAT_BASE_URL,kChatGlobalURL } from "../../lib/networking/ApiConstants";

export const CHATLOGS = "chatrequest/my_logs?limit=";
export const FETCHMESSAGES = "chatrooms/reverse_message?roomId=";
export const LISTUSERS = "user/all?limit=";
export const IMAGEUPLOAD = "/chat/uploadImage";
export const VIDEOUPLOAD = "/chat/uploadVideo";
export const DOCUPLOAD = "/chat/uploadDoc";
export const EXPORTCHAT = "/chatrooms/export_chat?userId=";
export const CLEARCHAT = "chatrooms/clearChat";
export const ARCHIVELIST = "chatrooms/ListArchive?userId=";
export const ARCHIVESINGLECHAT = "chatrooms/updateArchive";
export const DELETEROOM = "chatrooms/deletegroup?roomId=";
export const MUTECHAT = "chatrooms/mute_chat";

// GET METHOD
export function getAxios(
    url,
    params = {},
    headers = {},
    initialCallback,
    onCompletionCallBack
  ) {
    if (initialCallback) {
      initialCallback();
    }
  
    var urlValue = `${CHAT_BASE_URL}${url}`;
    console.log("REQUEST URL:", urlValue);
    console.log("REQUEST PARAMS:", params);
    console.log("REQUEST METHOD: GET");
  
    axios
      .get(urlValue, params, { headers: headers }, { timeout: 10000 })
      .then(function(response) {
        console.log(
          "URL----" +
            urlValue +
            "/n Request Method------  GET" +
            "/n Params-----" +
            params +
            "/n Response----" +
            JSON.stringify(response)
        );
        onCompletionCallBack(response);
      })
      .catch(function(error) {
        console.log("Error", error.response);
        onCompletionCallBack(error.response);
      });
}

// PUT METHOD
export function putAxios(
  url,
  params = {},
  headers = {},
  initialCallback,
  onCompletionCallBack
) {
  if (initialCallback) {
    initialCallback();
  }

  var urlValue = `${CHAT_BASE_URL}${url}`;
  console.log("REQUEST URL:", urlValue);
  console.log("REQUEST PARAMS:", params);
  console.log("REQUEST METHOD: PUT");

  axios
    .put(urlValue, params, { headers: headers }, { timeout: 10000 })
    .then(function(response) {
      console.log(
        "URL----" +
          urlValue +
          "/n Request Method------  GET" +
          "/n Params-----" +
          params +
          "/n Response----" +
          JSON.stringify(response)
      );
      onCompletionCallBack(response);
    })
    .catch(function(error) {
      console.log("Error", error.response);
      onCompletionCallBack(error.response);
    });
}

//POST METHOD
export function postAxios(
  url,
  params = {},
  headers = {},
  initialCallback,
  onCompletionCallBack
) {
  if (initialCallback) {
    initialCallback();
  }

  var urlValue = `${kChatGlobalURL}${url}`;
  console.log("REQUEST URL:", urlValue);
  console.log("REQUEST PARAMS:", params);
  console.log("REQUEST METHOD: POST");

  axios
    .post(urlValue, params, { headers: headers }, { timeout: 10000 })
    .then(function(response) {
      console.log(
        "URL----" +
          urlValue +
          "/n Request Method------  POST" +
          "/n Params-----" +
          params +
          "/n Response----" +
          JSON.stringify(response)
      );
      onCompletionCallBack(response);
    })
    .catch(function(error) {
      console.log("Error", error);
      console.log("hello error ====" + JSON.stringify(error));
      onCompletionCallBack(error);
    });
}

/** Chat Logs */
export function chatLogs(limit,page,userId, initialCallback, onCompletionCallBack) {
    let url = CHATLOGS+limit+"&page="+page+"&userId="+userId
    getAxios(url, {}, {},initialCallback, onCompletionCallBack);
}

/** Chat Fetch Messages */
export function fetchMessages(limit,page,userId,roomId, initialCallback, onCompletionCallBack) {
  let url = FETCHMESSAGES+roomId+"&userId="+userId+"&limit="+limit+"&page="+page
  getAxios(url, {}, {},initialCallback, onCompletionCallBack);
}

/** List users */
export function listUsers(limit,page,userId,initialCallback, onCompletionCallBack) {
  let url = LISTUSERS+limit+"&userId="+userId+"&page="+page+"&search="
  getAxios(url, {}, {},initialCallback, onCompletionCallBack);
}

/** Image upload */
export function chatImageUpload(param,initialCallback, onCompletionCallBack) {
  let url = IMAGEUPLOAD
  postAxios(url, param, {},initialCallback, onCompletionCallBack);
}

/** Video upload */
export function chatVideoUpload(param,initialCallback, onCompletionCallBack) {
  let url = VIDEOUPLOAD
  postAxios(url, param, {},initialCallback, onCompletionCallBack);
}

/** file upload */
export function chatFileUpload(param,initialCallback, onCompletionCallBack) {
  let url = DOCUPLOAD
  postAxios(url, param, {},initialCallback, onCompletionCallBack);
}

/** Export Chat Messages */
export function exportChat(userId,roomId, initialCallback, onCompletionCallBack) {
  let url = EXPORTCHAT+userId+"&roomId="+roomId
  getAxios(url, {}, {},initialCallback, onCompletionCallBack);
}

/** Clear Chat Messages */
export function clearChat(userId,roomId, initialCallback, onCompletionCallBack) {
  let url = CLEARCHAT
  let params = {
    "userId":userId,
    "roomId":roomId
  }
  putAxios(url, params, {},initialCallback, onCompletionCallBack);
}

/** Archive Single Chat Messages */
export function archiveSingleChat(userId,roomId,isArchive,initialCallback, onCompletionCallBack) {
  let url = ARCHIVESINGLECHAT
  let params = {
    "userId":userId,
    "roomId":roomId,
    "isArchive":isArchive
  }
  putAxios(url, params, {},initialCallback, onCompletionCallBack);
}

/** Archive List */
export function archiveLists(userId, initialCallback, onCompletionCallBack) {
  let url = ARCHIVELIST+userId
  getAxios(url, {}, {},initialCallback, onCompletionCallBack);
}

/** Delete Chat */
export function deleteRoom(userId,roomId, initialCallback, onCompletionCallBack) {
  let url = DELETEROOM+roomId+"&isGroup=false&senderUser="+userId+"&isGroup=1"
  getAxios(url, {}, {},initialCallback, onCompletionCallBack);
}

/** Mute Chat */
export function muteChat(userId,roomId,ismute, initialCallback, onCompletionCallBack) {
  let url = MUTECHAT
  let params = {
    "userId":userId,
    "roomId":roomId,
    "isMute":ismute
  }
  putAxios(url, params, {},initialCallback, onCompletionCallBack);
}