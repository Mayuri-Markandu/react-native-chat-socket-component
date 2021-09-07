import React, { Component } from "react";
import { View, Text,AppState, SafeAreaView, Image} from "react-native";
import ChatSocket from "Components/ChatSocket/ChatSocket";
const io = require('socket.io-client');
import { connect } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage';
import {kChatGlobalURL} from '../../lib/networking/ApiConstants'
import axios from "axios"

//let kChatGlobalURL = "http://52.66.180.172:9003"
var socket  = null

class InitialView extends Component {
  
  /** constructor */
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState
    };
    this._navigateToMainView();
    socket = io(kChatGlobalURL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 100,
      agent: false,
      upgrade: false,
      rejectUnauthorized: false,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 99,
      jsonp: false,
      rejectUnauthorized: false,
    }); 
  }

  /** Component Cycle */
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    // setTimeout(() => {
    //   this.props.navigation.navigate("UnRegisteredRoot")
    // }, 5000);
    const token = await AsyncStorage.getItem('access_token')
    if(token != undefined && token != "" && token != null){
      console.log("TOKEN>>>>>",token)
      axios.defaults.headers.common['Authorization'] = token
      this.props.navigation.navigate('RegisteredRoute')
    }else{
      this.props.navigation.navigate("UnRegisteredRoot")
    }
  }


  componentWillUnmount() {
    //AppState.removeEventListener('change', this._handleAppStateChange);
  }

  //DISCONNECT MANUALLY ON APP TERMINATION
  disconnectOnTermination = (param) => { // param userId
    console.log("Called",param)
    //this.connectOnForeground()
        socket.emit('disconnect-mannual', param , (data) => {
            console.log("DISCONNECTED",data); // data will be 'woot'
          });
        socket.disconnect()
   }

   //CONNECT ON APP FOREGROUND
   connectOnForeground = () => {
        socket.disconnect()
        socket = io(kChatGlobalURL, {
            transports: ['websocket'],
            jsonp: false
          });
          console.log("CONNECTED")
        socket.connect()
   }

  /** App state check */
  _handleAppStateChange = async(nextAppState) => {
    console.log("APP STATUS OUTSIDE",nextAppState)
    const userID = await AsyncStorage.getItem('user-id')
    if (nextAppState === 'active') {
      //App has come to the foreground!'
          this.connectOnForeground()
        
    }else{// App is terminated/App is in background
      console.log("APP STATUS",nextAppState,userID)
      if(userID != null && userID != undefined){
        let param = {
          userId: userID
        }
        this.disconnectOnTermination(param)
      }
      
    }
    this.setState({ appState: nextAppState });
  };
  

  _navigateToMainView = async () => { };

  _navigateToLogin = () => {
    setTimeout(() => {
      this.props.navigation.navigate("Login");
    }, 2000)
  }

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
      <ChatSocket
          ref={(refs) => { this.chatSocket = refs }} 
          SERVER_URL={kChatGlobalURL}
        />
        <View
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: '#fff'
          }}
        >
          <Text style={{ fontWeight:'bold',fontSize: 20, color: "#00004d" }}>OPTI REACT CHAT</Text>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  const { loginId } = state.LoginReducer

  return {
    loginId,
  }
}

export default connect(
  mapStateToProps
)(InitialView)


