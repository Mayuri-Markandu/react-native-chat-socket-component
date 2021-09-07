import React, { Component } from "react";
import { Dimensions, Animated, Easing } from "react-native";
import {createAppContainer} from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';
import Feature from "../Views/Feature/Feature"
import ChatRoom from "../Views/ChatRoom/ChatRoom"
import ChatLog from "../Views/ChatLogs/ChatLog"
import Users from "../Views/Users/Users"
import UnRegisteredRoot from "./UnRegisteredRoute"
import ForwardUsers from "../Views/ForwardUsers/ForwardUsers"
import ArchiveChats from "../Views/ArchiveChat/ArchiveChats"

export default class RegisteredRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const RegisteredNavigation = createStackNavigator(
      {
        // Feature: {
        //   screen: Feature
        // },
        ChatLog:  { 
          screen: ChatLog
        },
        ChatRoom: { 
          screen: ChatRoom 
        },
        Users:{
          screen: Users
        },
        ForwardUsers:{
          screen:ForwardUsers
        },
        ArchiveChats:{
          screen:ArchiveChats
        },
        UnRegisteredRoot:UnRegisteredRoot
     },
      { 
        animationEnabled: false,
        swipeEnabled: false,
        headerMode: "none",
        defaultNavigationOptions: {
        gesturesEnabled: false
        }
      }
    );
    const AppContainer = createAppContainer(RegisteredNavigation);

    return (<AppContainer />);

  }
}