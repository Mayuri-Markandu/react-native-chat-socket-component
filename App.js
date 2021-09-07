/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from "react";
import {
    StatusBar
} from "react-native";
import {DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { configStore } from "./src/configs/configStore";
import InitialRoute from "./src/navigation/InitialRoute";
import AntDesign from 'react-native-vector-icons/AntDesign'

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#3498db',
      background:"green",
      accent: '#f1c40f',
    },
  };

  if(__DEV__) {
    import('./src/configs/ReactotronConfig').then(() => console.log('Reactotron Configured'))
  }
  
const App = () => {
    console.reportErrorsAsExceptions = false;
    console.disableYellowBox = true;
    return (
        <Fragment>
            {/* <StatusBar backgroundColor="black" barStyle="light-content" /> */}
            <StoreProvider store={configStore}>
            <PaperProvider
            theme={theme}
            settings={{
                icon: props => <AntDesign {...props} />,
              }}>
                <StatusBar
                    backgroundColor="black"
                    barStyle="dark-content"
                    translucent={false}
                />
                <InitialRoute />
                </PaperProvider>
            </StoreProvider>
        </Fragment>
    );
};

export default App;