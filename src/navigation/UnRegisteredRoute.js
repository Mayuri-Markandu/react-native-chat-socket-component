import React from 'react'
import { createStackNavigator } from 'react-navigation-stack';
import RegisteredRoute from "./RegisteredRoute";
import Login from "../Views/Login/Login";

const UnRegisteredRoot = createStackNavigator(
  {
    Login: {
      screen: Login
    },
    RegisteredRoute:  RegisteredRoute,
  },
  {
    headerMode: "none",
    initialRouteName: "Login",
    animationEnabled: false,
    swipeEnabled: false,
    headerMode: "none",
    defaultNavigationOptions: {
    gesturesEnabled: false
    }
  }
);

export default UnRegisteredRoot;
