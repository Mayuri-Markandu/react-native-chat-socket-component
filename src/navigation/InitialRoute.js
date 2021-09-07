import {
  createAppContainer,
  createSwitchNavigator
} from "react-navigation";
import UnRegisteredRoute from "./UnRegisteredRoute";
import InitialView from "../Views/InitialView/InitialView";
import RegisteredRoute from "./RegisteredRoute";

export const RootStack = createSwitchNavigator(
  {
    InitialView: InitialView,
    UnRegisteredRoot: UnRegisteredRoute,
    RegisteredRoute: RegisteredRoute,

  },
  {
    animationEnabled: false,
    swipeEnabled: false,
    headerMode: "none",
    defaultNavigationOptions: {
    gesturesEnabled: false
    },
    initialRouteName: "InitialView"
  }
);
export const App = createAppContainer(RootStack);
export default App;
