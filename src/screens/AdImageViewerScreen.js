import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, ImageBackground } from "react-native";
import { useKeepAwake } from "expo-keep-awake";

import { Context as CampaignContext } from "../context/CampaignContext";
import useStreamingStatus from "../hooks/useStreamingStatus";
import useClearHistory from "../hooks/useClearHistory";

const DISPLAY_TIME = 40;
const TIME_TILL_GAME = 540;

const AdImageViewerScreen = ({ navigation }) => {
  useKeepAwake();
  const [displayTimeCounter, setDisplayTimeCounter] = useState(DISPLAY_TIME);

  const displayTimerRef = useRef(null);
  const didCancel = useRef(null);

  const [streamStatus] = useStreamingStatus();
  const [clearHistory] = useClearHistory();

  const { updateCampaignStat } = useContext(CampaignContext);

  useEffect(() => {
    if (streamStatus === "off") {
      clearHistory();
      navigation.navigate("NoActivity");
    }
  }, [streamStatus]);

  useEffect(() => {
    if (displayTimeCounter === 0) {
      const { timeToGame, playlistItem, playlistLength } =
        navigation.state.params;

      // make a request to update campaign stat
      updateCampaignStat(playlistItem.resourceRef.id, {
        impressions: 1,
        playTimeInSeconds: playlistItem.durationInSeconds,
      });

      // increment lastPlayedIndex in local storage
      (async () => {
        const lastPlayedIdxJson = await AsyncStorage.getItem("playlistIndex");
        const lastPlayedObj = lastPlayedIdxJson
          ? JSON.parse(lastPlayedIdxJson)
          : { atIndex: 0 };

        const isLastIndex = lastPlayedObj.atIndex + 1 === playlistLength;
        const updatedIndex = isLastIndex ? 0 : lastPlayedObj.atIndex + 1;

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
        navigation.navigate("GameStart", { timeToGame: updatedTimeToGame });
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
  );
};

const styles = StyleSheet.create({
  adImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AdImageViewerScreen;
