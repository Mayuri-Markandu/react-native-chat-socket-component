import React, { Component } from 'react';
import { SafeAreaView,Alert, Button, ActivityIndicator, TextInput,TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { doLogin, userId } from '../../actions/Login/LoginAction'
import { connect } from 'react-redux'
import axios from "axios";
import ChatSocket from "Components/ChatSocket/ChatSocket";
import AsyncStorage from '@react-native-community/async-storage';
import {kChatGlobalURL} from '../../lib/networking/ApiConstants'

class Login extends Component {
  
  /** Constructor */
  constructor(props) {
    super(props);
    this.state = {
      username: 'react2@yopmail.com',
      password: 'optisol2019',
      editable: true,
      loginDisabled: false,
      load:false,
      hitApi:false
    };
    
  }

  componentDidMount() {
   // this.connectOnForeground()
  }

  connectOnForeground = () => {
    //socket.disconnect();

    // console.log('CONNECTED');
   
  };

  /** Component cycle */
  UNSAFE_componentWillReceiveProps(nextProps){
    console.log("PROPS",nextProps.loginSuccess)
    if(this.state.hitApi){
      if(nextProps.loginSuccess.length !== 0){
        let data = nextProps.loginSuccess
        let userData = {
          "userid": data.User_id
        }
        this.props.userId(nextProps.loginSuccess.User_id)
        AsyncStorage.setItem('user-id',nextProps.loginSuccess.User_id)
        let token = 'Bearer ' + nextProps.loginSuccess.access_token
        AsyncStorage.setItem('access_token',token)
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + nextProps.loginSuccess.access_token
        this.socketConfig(nextProps.loginSuccess.User_id)
        this.setState({load: false, hitApi: false})
      }else if(nextProps.loginFailure.length !== 0){
        this.setState({load: false, hitApi: false})
      }
    }
}

socketConfig = (userId) => {
  if(this.chatSocket != undefined){
    this.chatSocket.connectOnForeground()
    this.chatSocket.checkConnectedStatus((status) => {
      console.log("STATUS",status)
      if(status){
          //this.chatSocket.newMessage()
          
        let param = {
          userId: userId
        }
        this.chatSocket.newUserChat(param,(data) => {
          console.log("APP JS NEW USER",data)
          this.props.navigation.navigate('RegisteredRoute')
        })
        // let param1 = {
        //   receiverId : "1733bbe2-a0ff-4069-bfbb-ae6719cd7a18",
        //   senderId:"2411f8d3-349a-43fe-bb44-0af4624d2f43"
        // }
        // this.chatSocket.joinUserChat(param1,(data) => {
        //   console.log("APP JOIN CHAT",data)
        // })
        
      }
    })
  }
}
  
  /** Login Action */
  onLogin() {
    const { username, password } = this.state;
    this.setState({
        load:true,
        loginDisabled:true,
        editable:false,
        hitApi:true
    })
    let data = {
        'username': this.state.username,
        'password': this.state.password,
        'traffic':'chat'
      }
    this.props.doLogin(data)
  }

  /** Rendering */
  render() {
    return (
      <SafeAreaView style={styles.container}>
      <ChatSocket
          ref={(refs) => { this.chatSocket = refs }} 
          SERVER_URL={kChatGlobalURL}
        />
      <Text style={{fontWeight:'bold',color:"#000034",fontSize:18,marginTop:20,marginBottom:30}}>Opti React Chat</Text>
        <TextInput
          value={this.state.username}
          onChangeText={(username) => this.setState({ username })}
          placeholder={'Username'}
          style={styles.input}
          editable={this.state.editable}
        />
        <TextInput
          value={this.state.password}
          onChangeText={(password) => this.setState({ password })}
          placeholder={'Password'}
          secureTextEntry={true}
          style={styles.input}
          editable={this.state.editable}
        />
        <TouchableOpacity
          disabled={this.state.loginDisabled}
          style={[{backgroundColor:"#000034",borderWidth:0,borderRadius:5,height:55,width:"70%",alignSelf:"center",justifyContent:"center"}]}
          onPress={this.onLogin.bind(this)}
        >
            <Text style={{fontWeight:'bold',fontSize:18,color: "white",alignSelf:"center"}}>LOGIN</Text>
        </TouchableOpacity>
        <Text style={{fontSize:8,textAlign:"center",alignSelf:"center",marginTop:20,color:"gray"}}>*--Uses Deelchats Environment--*</Text>
        {this.state.load && (
         <View style={[styles.activityContainer, styles.horizontal]}>
            <ActivityIndicator size="large" color="#ff8c00" />
            {/* <ActivityIndicator size="small" color="#ff8c00" /> */}
         </View>
        )}
      </SafeAreaView>
    );
  }
}

/** Styling */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  input: {
    width: "70%",
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },
  activityContainer: {
    height:100,
    width:100,
    justifyContent: 'center',
    alignSelf:"center"
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  }

});

const mapStateToProps = state => {
    const { loginSuccess, loginFailure, loginId } = state.LoginReducer
  
    return {
      loginSuccess,
      loginFailure,
      loginId,
    }
  }
  
  export default connect(
    mapStateToProps,
    {
      doLogin,userId
    }
  )(Login)
