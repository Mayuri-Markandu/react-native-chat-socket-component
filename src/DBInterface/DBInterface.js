import { DbSchemas } from "./DBModel";
const Realm = require('realm')
import {Component} from "react"
import Reactotron from 'reactotron-react-native'
import { roomId } from "../actions/Login/LoginAction";
const _ = require("underscore");

export default class DBInterface {

    static async insertChatRoomData(chatMessages,roomId) {
        console.log("CHATMSGS REALM>>>>",chatMessages)
        const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1 }).catch(error => {
          console.log("realmError", error);
        })
            realmDb.write(() => {
                chatMessages.forEach(obj => {
                        let chatMsgsData = realmDb.objects("chat_room_msgs_data").filtered(`TMESSAGES_Message_ID=${obj.TMESSAGES_Message_ID}`)
                        if (chatMsgsData.length === 0) { // content not there in db it creates one
                            realmDb.create("chat_room_msgs_data", obj);
                            console.log("REALM created",realmDb)
                        }
                        let getData = realmDb.objects("chat_room_msgs_data").filtered(`TMESSAGES_Message_ID=${obj.TMESSAGES_Message_ID}`)
                        console.log("REALM GETDATA",getData)
                });
            });
        
    }

    static async insertLogData(chatLogs) {
        console.log("CHATLOGSSS REALM>>>>",chatLogs)
        const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1 }).catch(error => {
          console.log("realmError", error);
        })
        realmDb.write(() => {
                    chatLogs.forEach(obj => {
                    let chatLogsData = realmDb.objects("chat_log_data").filtered(`TChat_Log_Chat_Room_ID=${obj.TChat_Log_Chat_Room_ID}`)
                      if (chatLogsData.length === 0) { // content not there in db it creates one
                        realmDb.create("chat_log_data", obj);
                        console.log("REALM created",realmDb)
                      }
                      let getData = realmDb.objects("chat_log_data").filtered(`TChat_Log_Chat_Room_ID=${obj.TChat_Log_Chat_Room_ID}`)
                      console.log("REALM GETDATA",getData)
                      console.log(getData[0])
            });
        });
    }

    static async deleteSingleLogData(chatRoomId) {
        console.log("DELETING ROOMID",chatRoomId)
        const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1 }).catch(error => {
         console.log("realmError", error);
        })
            realmDb.write(() => {
                const deleteData = realmDb.objects('chat_log_data')
                    .filtered(
                    'TChat_Log_Chat_Room_ID == $0',
                    chatRoomId)
                    realmDb.delete(deleteData)
                });
                let getData = realmDb.objects("chat_log_data").filtered(`TChat_Log_Chat_Room_ID=${chatRoomId}`)[0]
                console.log("REALM GETDATA AFTER DELETING",getData.length)
     };

     static async deleteRoomMsg(msgId) {
        console.log("DELETING chat msg",msgId)
        const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1 }).catch(error => {
         console.log("realmError", error);
        })
            realmDb.write(() => {
                const deleteData = realmDb.objects('chat_room_msgs_data')
                    .filtered(
                    'TMESSAGES_Message_ID == $0',
                    msgId)
                    realmDb.delete(deleteData)
                });
                let getData = realmDb.objects("chat_room_msgs_data").filtered(`TMESSAGES_Message_ID=${msgId}`)[0]
                console.log("REALM GETDATA AFTER DELETING",getData.length)
     };

     static async UpdateSingleLogData(chatRoomId,chatLogdata) {
        console.log("UPDAting",chatLogdata)
        const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1 }).catch(error => {
        //console.log("realmError", error);
        })
        // Realm.open(realmDb).then(realm => {
            let updateData = realmDb.objects('chat_log_data')
                    .filtered(
                    'TChat_Log_Chat_Room_ID == $0',
                    chatRoomId)
            if (updateData.length > 0) {
                realmDb.write(() => {
                    realmDb.delete(updateData)
                    realmDb.create("chat_log_data", chatLogdata);
                    //console.log("REALM UPDATEDATA",updateData)
                });
              }
                let getData = realmDb.objects("chat_log_data").filtered(`TChat_Log_Chat_Room_ID=${chatRoomId}`)
                console.log("REALM GETDATA AFTER UPDATING",getData)
            // });
     };

     static async getChatLogs(userId) {
         console.log("GET CHAT LOGS")
        const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1}).catch(error => {
          console.log("realmError", error);
        });
    
        let logDatas = realmDb.objects("chat_log_data").filtered(`DUSER_ROOM_UID == $0`,userId)
    
        console.log("deviceDatas", logDatas);
    
        let arrayResults = _.values(logDatas);
        console.log("Array Results Reactotron",arrayResults)
    
        //result = optimized_result;
    
        //console.log("DeviceDaxzctas" + JSON.stringify(result));
        return arrayResults;
      }

      static async getChatMsgs(userId,chatRoomId) {
        console.log("GET CHAT Msgs")
       const realmDb = await Realm.open({ schema: DbSchemas, schemaVersion: 1}).catch(error => {
         console.log("realmError", error);
       });
   
       let logDatas = realmDb.objects("chat_room_msgs_data").filtered(`TMESSAGES_Chat_Room_ID=${chatRoomId}`)
   
       console.log("Chat Messages", logDatas);
   
       let arrayResults = _.values(logDatas);
       console.log("Array Results Reactotron",arrayResults)
   
       //result = optimized_result;
   
       //console.log("DeviceDaxzctas" + JSON.stringify(result));
       return arrayResults;
     }
}