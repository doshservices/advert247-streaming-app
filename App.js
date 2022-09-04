import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import * as Font from "expo-font";
import { useFonts } from "@use-expo/font";
import AppLoading from "expo-app-loading";
import { MenuProvider } from "react-native-popup-menu";

import { Provider as DriverProvider } from "./src/context/DriverContext";
import { Provider as VodContentProvider } from "./src/context/VodContentContext";
import { Provider as TriviaProvider } from "./src/context/TriviaContext";
import { Provider as RiderProvider } from "./src/context/RiderContext";
import { Provider as StreamingProvider } from "./src/context/StreamingContext";
import { Provider as PlaylistProvider } from "./src/context/PlaylistContext";
import { Provider as CampaignProvider } from "./src/context/CampaignContext";

import SigninScreen from "./src/screens/SigninScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import PreAuthScreen from "./src/screens/PreAuthScreen";
import DriverInfoScreen from "./src/screens/DriverInfoScreen";
import AdPlayerScreen from "./src/screens/AdPlayerScreen";
import GameStartScreen from "./src/screens/GameStartScreen";
import GameIntroScreen from "./src/screens/GameIntroScreen";
import TriviaQuestionScreen from "./src/screens/TriviaQuestionScreen";
import RiderInfoScreen from "./src/screens/RiderInfoScreen";
import TriviaResultScreen from "./src/screens/TriviaResultScreen";
import NoActivityScreen from "./src/screens/NoActivityScreen";
import PermissionGatewayScreen from "./src/screens/PermissionGatewayScreen";
import AdImageViewerScreen from "./src/screens/AdImageViewerScreen";

import { setNavigator } from "./src/navigationRef";

const customFonts = {
  Audiowide: require("./assets/fonts/Audiowide-Regular.ttf"),
  RobotoRegular: require("./assets/fonts/Roboto-Regular.ttf"),
  RobotoMedium: require("./assets/fonts/Roboto-Medium.ttf"),
  RobotoBold: require("./assets/fonts/Roboto-Bold.ttf"),
};

const navigator = createSwitchNavigator({
  PreAuth: PreAuthScreen,
  Signin: SigninScreen,
  PermissionGateway: PermissionGatewayScreen,
  welcomeFlow: createStackNavigator({
    Welcome: WelcomeScreen,
    DriverInfo: DriverInfoScreen,
  }),
  AdPlayer: AdPlayerScreen,
  AdImageViewer: AdImageViewerScreen,
  GameStart: GameStartScreen,
  GameIntro: GameIntroScreen,
  TriviaQuestion: TriviaQuestionScreen,
  RiderInfo: RiderInfoScreen,
  TriviaResult: TriviaResultScreen,
  NoActivity: NoActivityScreen,
});

const App = createAppContainer(navigator);

export default () => {
  const [isLoaded] = useFonts(customFonts);
  console.log(isLoaded);
  if (!isLoaded) {
    return <AppLoading />;
  }

  return (
    <MenuProvider>
      <DriverProvider>
        <VodContentProvider>
          <TriviaProvider>
            <PlaylistProvider>
              <RiderProvider>
                <CampaignProvider>
                  <StreamingProvider>
                    <App ref={(navigator) => setNavigator(navigator)} />
                  </StreamingProvider>
                </CampaignProvider>
              </RiderProvider>
            </PlaylistProvider>
          </TriviaProvider>
        </VodContentProvider>
      </DriverProvider>
    </MenuProvider>
  );
};
