import React, { useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  ImageBackground,
  View,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Context as CampaignContext } from "../context/CampaignContext";
import { Context as DriverContext } from "../context/DriverContext";
import useStreamingStatus from "../hooks/useStreamingStatus";
import useClearHistory from "../hooks/useClearHistory";

const DISPLAY_TIME = 40;
const TIME_TILL_GAME = 540;

const SCREEN_HEIGHT = Dimensions.get("screen").height;

const AdImageViewerScreen = ({ navigation }) => {
  useKeepAwake();
  const [displayTimeCounter, setDisplayTimeCounter] = useState(DISPLAY_TIME);

  const displayTimerRef = useRef(null);
  const didCancel = useRef(null);

  const [streamStatus] = useStreamingStatus();
  const [clearHistory] = useClearHistory();

  const { updateCampaignStat } = useContext(CampaignContext);
  const {
    state: { user },
  } = useContext(DriverContext);

  useEffect(() => {
    if (streamStatus === "off") {
      clearHistory();
      navigation.navigate("NoActivity");
    }
  }, [streamStatus]);

  useEffect(() => {
    if (displayTimeCounter === 0) {
      const { timeToGame, playlistItem, playlistLength, lastPlayedIdx } =
        navigation.state.params;

      // make a request to update campaign stat
      updateCampaignStat(playlistItem.resourceRef.id, {
        impressions: 1,
        playTimeInSeconds: DISPLAY_TIME,
      });

      // increment lastPlayedIndex
      const isLastIndex = lastPlayedIdx + 1 === playlistLength;
      const updatedIndex = isLastIndex ? 0 : lastPlayedIdx + 1;
      (async () => {
        await AsyncStorage.setItem(
          "playlistIndex",
          JSON.stringify({
            atIndex: updatedIndex,
          })
        );
      })();

      // navigate to AdPlayer or GameStart based on the updated time to game (pass along the updated timeToGame if navigating to AdPlayer)
      const updatedTimeToGame = timeToGame + DISPLAY_TIME;
      if (updatedTimeToGame >= TIME_TILL_GAME) {
        navigation.navigate("GameStart");
      } else {
        navigation.navigate("AdPlayer", {
          timeToGame: updatedTimeToGame,
          lastPlayedIdx: updatedIndex,
        });
      }
    } else {
      let newCounter = displayTimeCounter - 1;
      displayTimerRef.current = setTimeout(() => {
        setDisplayTimeCounter(newCounter);
      }, 1000);
    }
  }, [displayTimeCounter]);

  useEffect(() => {
    didCancel.current = false;
    return () => {
      clearTimeout(displayTimerRef.current);
      didCancel.current = true;
    };
  }, []);

  const { playlistItem } = navigation.state.params;

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.1)"
        barStyle="light-content"
        translucent={true}
      />
      <ImageBackground
        source={{
          uri:
            playlistItem?.mediaUrl ||
            "https://i.ytimg.com/vi/w2w0Py9A8IE/maxresdefault.jpg",
        }}
        style={styles.adImage}
        resizeMode="cover"
        resizeMethod="resize"
      ></ImageBackground>
      <View style={styles.settingsBar}>
        <Image
          source={require("../../assets/logoAlt.png")}
          resizeMode="contain"
          style={styles.logoStyle}
        />
        <View style={styles.leftCol}>
          <View style={styles.driverInfo}>
            <Image
              source={
                user?.profilePhoto
                  ? { uri: user?.profilePhoto }
                  : require("../../assets/avatar-placeholder.png")
              }
              style={styles.driverImg}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.1,
  },
  container: {
    flex: 1,
  },
  settingsBar: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.1,
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#262525",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("3.4%"),
  },
  logoStyle: {
    width: hp("30%"),
    height: hp("20%"),
    // borderColor: '#fff',
    // borderWidth: 2
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImg: {
    width: hp("9%"),
    height: hp("9%"),
    borderRadius: hp("5.5%"),
  },
});

export default AdImageViewerScreen;
