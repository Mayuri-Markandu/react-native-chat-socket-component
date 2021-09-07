import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Keyboard,
  StatusBar,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  NativeModules, Button
} from 'react-native';
import io from 'socket.io-client';
import OfflineNotice from "Components/OfflineNotice/OfflineNotice";
import ChatSocket from "Components/ChatSocket/ChatSocket";
import {listUsers} from "Components/ChatSocket/ChatSocketApi";
import { Avatar } from 'react-native-paper';
import { connect } from 'react-redux'
import {kChatGlobalURL} from '../../lib/networking/ApiConstants'
import { Checkbox } from 'react-native-paper';
import moment from "moment";

class ForwardUsers extends React.Component{  

    /** constructor */
    constructor(props) {  
        super(props);
        this.state = { 
          users:[],
          load:false,
          limit:50,
          chatRoomData:[],
          selectedUsers:[],
          selectedMsgToForward:this.props.navigation.getParam("selectedMsgToForward")
        };
        this.pageNumber = 1
    }

    /** Component Cycle */
    componentDidMount() {
        this.setState({
            load:true
        })
        this.chatUsersApiHit(this.pageNumber)
    }

    /** ChatUsers */
    chatUsersApiHit = (page) => {
        listUsers(this.state.limit,page,this.props.loginId,() => {},(response) => {
            console.log("USERS",response)
            this.setState({
                load:false
            })
            if(response.status == 200){
                let dataArray = response.data.data
                let arr = new Array()
                for (let i = 0; i < dataArray.length; i++) {
                    const element = dataArray[i];
                    let dict = { 
                        ...element,
                        checked:false
                    }
                    arr.push(dict)
                    this.setState({
                        users:arr
                    })
                }
            }
            console.log("LENGTH",this.state.users.length)
        })
    }

    /** Socket Configuration */
    socketConfig = (userId) => {
        if(this.chatSocket != undefined){
        // this.chatSocket.connectOnForeground()
        // this.chatSocket.checkConnectedStatus((status) => {
            //console.log("STATUS",status)
            // if(status){                
            let param = {
                userId: userId
            }
            this.chatSocket.newUserChat(param,(data) => {
                console.log("APP JS NEW USER",data)
            })
            let param1 = {
              receiverId : userId,
              senderId:this.props.loginId
            }
            this.chatSocket.joinUserChat(param1,(data) => {
              console.log("APP JOIN CHAT",data)
              if(data.success){
                let dataDict = {
                    "chatRoomId":data.responseData.chatRoomId,
                    "roomname":`${this.props.loginId}&${userId}`
                }
                this.state.chatRoomData.push(dataDict)
                console.log("lengths",this.state.chatRoomData.length,this.state.chatRoomData)
                if(this.state.selectedUsers.length == this.state.chatRoomData.length){
                    this.sendMessages()
                }
              }
             })
        //     }
        // })
        }
    }

    joinUsersToForward = () => {
        for (let i = 0; i < this.state.users.length; i++) {
            const element = this.state.users[i];
            if(element.checked){
                this.state.selectedUsers.push(element)
            }
        }
        console.log("SELECTED USERS",this.state.selectedUsers)
        for (let i = 0; i < this.state.selectedUsers.length; i++) {
            const element = this.state.selectedUsers[i];
            this.socketConfig(element.DN_ID)
        }
        
    }

    /** Render logs */
    renderUsers(item,index) {
        return(
            <TouchableOpacity
            style={styles.viewLog}
            onPress={() => {
                console.log("Log nviagtion",this.props)
                
            }}>
            <View style={styles.outerViewAlign}>
                <View style={styles.avatar}>
                    <Avatar.Image style={{backgroundColor:"#d3d3d3",resizeMode:"contain"}} size={50} source={item.DC_USER_IMAGE != null ? {uri:item.DC_USER_IMAGE} : require('Components/ChatSocket/assets/user.png')} />
                </View>
                <View style={styles.innerView}>
                    <Text style={{fontSize:15,margin:2,fontWeight: item.Unread_msg_count != 0 ? 'bold' : 'normal'}}>{item.DC_USERNAME}</Text>
                </View>
                <Checkbox
                    style={{alignSelf:"flex-end"}}
                    status={item.checked ? 'checked' : 'unchecked'}
                    onPress={() => {
                        this.selectUsers(item,index)
                    }}
                />
              </View>
            </TouchableOpacity>
        )
    }

    selectUsers = (item,index) => {
        let targetItem = this.state.users[index]
        targetItem.checked = !targetItem.checked
        this.state.users[index] = targetItem
        this.setState({
            users: [
              ...this.state.users,
              //[index]: targetItem
            ]
          })
    }

    sendMessages = () => {
            let msgParam = { 
              "roomname":this.props.navigation.getParam("roomName"),
              "chatRoomId":this.state.selectedMsgToForward.TMESSAGES_Chat_Room_ID,
              "msg": this.state.selectedMsgToForward.TMESSAGES_Content,
              "hasMsg": true,
              "hasFile": this.state.selectedMsgToForward.TMESSAGES_File_Type == "text" ? false : true,
              "isReply": false,
              "reply_file_type": 'text',
              "replayMsgId": 0,
              "messageContant": "",
              "msgTime": moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS"),
              "istype": this.state.selectedMsgToForward.TMESSAGES_File_Type,
              "isGroup": false,
              "userId": this.props.loginId,
              "users":this.state.chatRoomData
            }
            console.log("forward params",msgParam)
        this.chatSocket.sendMessageToUsers(msgParam,(data) => {
            if(data.success){
                this.props.navigation.navigate("ChatLog")
            }
        })
    }


    /** Rendering */
    render() {
        return (
            <SafeAreaView style={styles.container}>
            <ChatSocket
                ref={(refs) => { this.chatSocket = refs }} 
                SERVER_URL={kChatGlobalURL}
            />
            <View style={styles.headerBg}>
            <TouchableOpacity style={{height:40,width:80,justifyContent:"center"}} onPress={()=>{
                 this.props.navigation.goBack()
               }}>
                <Text style={{fontSize:16,marginLeft:10,fontWeight:"bold",color:"white"}}>Back</Text>
               </TouchableOpacity>
             <Text style={styles.headerText}>USERS LIST</Text>
             <TouchableOpacity style={{height:40,width:80,justifyContent:"center"}} onPress={()=>{
                 
                 this.joinUsersToForward()
               }}>
                <Text style={{fontSize:16,marginLeft:10,fontWeight:"bold",color:"white"}}>Done</Text>
               </TouchableOpacity>

            </View>
            {this.state.users.length == 0 && this.state.load == false && (
                <Text style={{fontSize:15,marginTop:30,fontWeight:'bold',alignSelf:"center",color:"#00004d"}}>No Users found {this.state.users.length}</Text>
            )}

            {this.state.users.length == 0 ? (
                <Text style={{fontSize:15,marginTop:30,fontWeight:'bold',backgroundColor:"orange",alignSelf:"center",color:"#00004d"}}></Text>
            ) : 
            <FlatList
                    data={this.state.users}
                    renderItem={({item, index}) => (this.renderUsers(item,index))}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingBottom: 20}}
                    ItemSeparatorComponent={() => (
                        <View style={[styles.separator]} />
                      )}
                />
            }
            {this.state.load && (
                <View style={[styles.activityContainer, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#FA1100" />
                </View>
            )}
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
  
    container: {
      flex: 1,
      flexDirection: 'column',
      //justifyContent: 'space-between',
      backgroundColor: 'white'
    },
    activityContainer: {
        height:100,
        width:100,
        justifyContent: 'center',
        alignSelf:"center"
      },
      separator:{
        height:1,
        backgroundColor:"gray"
      },
    headerBg:{
        backgroundColor:"#00004d",
        height: 50,
        width:"100%",
        flexDirection:"row",
        justifyContent:"space-between",
        //alignItems:"center"
    },
    headerText:{
        color:"white",
        fontWeight:'bold',
        fontSize:18,
        marginTop:10
    },
    avatar:{
        backgroundColor:"#d3d3d3",
        height:50,
        width:50,
        borderRadius:25,
        justifyContent:"center",
        alignItems:"center"
    },
    innerView:{
        flexDirection:"column",
        marginLeft:10
    },
    count:{
        marginTop:10,
        height:25,
        width:25,
        marginRight:30,
        backgroundColor:"green",
        borderRadius:12.5,
        justifyContent:"center",
        alignItems:"center"
    },
    outerViewAlign:{
        flexDirection:"row",
        width:"90%",
        marginLeft:10
    },
    viewLog:{
        flexDirection:"row",
        width:"95%",
        justifyContent:"center",
        // margin: 15,
        padding:10,
        backgroundColor:"white"
    }

})

const mapStateToProps = state => {
    const { loginId } = state.LoginReducer
  
    return {
      loginId,
    }
}
  
export default connect(
    mapStateToProps
)(ForwardUsers)