import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Audio, Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import LoaderAnimation from "./LoaderAnimation";
import { prepareVideoUrl } from "../utils/useCloudfrontForVideo";

const TIME_TILL_GAME = 540;

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.playbackInstance = null;
    this._isMounted = false;
    this.state = {
      index: 0,
      playlist: [],
      timeToGamePrompt: 0, // in seconds
      showCountdown: false,
      toAdCounter: 5,
      loopingType: false,
      muted: false,
      playbackInstancePosition: 0,
      playbackInstanceDuration: 0,
      shouldPlay: true,
      isPlaying: false,
      isBuffering: false,
      isLoading: true,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
    };
  }

  async componentDidMount() {
    this._isMounted = true;

    const savedIndex = await AsyncStorage.getItem("playlistIndex");
    const parsedIndexObj = savedIndex && JSON.parse(savedIndex);

    if (parsedIndexObj) {
      this.setState({ index: parsedIndexObj.atIndex });
    }

    const { timeToGame } = this.props.navigation.state.params;

    if (timeToGame) {
      this.setState({ timeToGamePrompt: timeToGame });
    }

    if (this._isMounted) {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.muteState !== prevProps.muteState) {
      // console.log(this.props.muteState);
      if (this.playbackInstance != null) {
        if (this._isMounted) {
          this.playbackInstance.setIsMutedAsync(this.props.muteState);
        }
      }
    }

    if (this.props.volumeState !== prevProps.volumeState) {
      // console.log(this.props.volumeState);
      if (this.playbackInstance != null) {
        if (this._isMounted) {
          this.playbackInstance.setVolumeAsync(this.props.volumeState);
        }
      }
    }

    const { mappedPlaylist } = this.props;

    if (
      mappedPlaylist.length > 0 &&
      mappedPlaylist !== prevProps.mappedPlaylist
    ) {
      if (this._isMounted) {
        this.setState({
          playlist: mappedPlaylist,
        });
      }
    }

    // const { index, playlist, showCountdown, playbackInstancePosition } =
    //   this.state;

    // if (
    //   playlist.length > 0 &&
    //   playlist[index + 1].contentType === "campaign" &&
    //   playlist[index].contentType !== "campaign"
    // ) {
    //   const adPromptTime = playbackInstanceDuration - 6000;

    //   if (playbackInstancePosition >= adPromptTime && !showCountdown) {
    //     if (this._isMounted) {
    //       this.setState({
    //         showCountdown: true,
    //       });
    //     }

    //     let timesToRun = 0;
    //     let adCounter = setInterval(() => {
    //       timesToRun += 1;
    //       if (timesToRun === 5) {
    //         clearInterval(adCounter);
    //       }

    //       if (this._isMounted) {
    //         this.setState({
    //           toAdCounter: this.state.toAdCounter - 1,
    //         });
    //       }
    //     }, 1000);
    //   }
    // }

    // if (this.state.index === 3 && this.state.showCountdown) {
    //   if (this._isMounted) {
    //     this.setState({
    //       showCountdown: false,
    //     });
    //   }
    // }
  }

  componentWillUnmount() {
    this._isMounted = false;
    const unloadVideoInstance = async () => {
      if (this.playbackInstance != null) {
        const { playbackInstancePosition, playlist, index } = this.state;
        const { updateCampaign, updateMediaPlays } = this.props;

        if (playlist[index].contentType === "campaign") {
          updateCampaign(playlist[index].resourceRef.id, {
            impressions: 1,
            playTimeInSeconds: playbackInstancePosition / 1000,
          });
        } else if (playlist[index].contentType === "non-campaign") {
          updateMediaPlays(playlist[index].resourceRef.id, { plays: 1 });
        }

        await this.playbackInstance.unloadAsync();
        this.playbackInstance = null;
      }
    };

    unloadVideoInstance();
  }

  async _loadNewPlaybackInstance(playing) {
    if (this.playbackInstance != null) {
      await this.playbackInstance.unloadAsync();
      // this.playbackInstance.setOnPlaybackStatusUpdate(null);
      this.playbackInstance = null;
    }

    if (this.state.timeToGamePrompt >= TIME_TILL_GAME) {
      this.setState({ timeToGamePrompt: 0 });
      this.props.navigation.navigate("GameStart");
    } else {
      const { playlist, index } = this.state;

      if (playlist[index].mediaType === "image") {
        this.props.navigation.navigate("AdImageViewer", {
          timeToGame: this.state.timeToGamePrompt,
          playlistItem: playlist[index],
          playlistLength: playlist.length,
        });
      }

      const source = {
        uri: prepareVideoUrl(
          playlist[index].contentType === "campaign",
          playlist[index].key
        ),
      };
      const initialStatus = {
        shouldPlay: playing,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
        volume: this.state.volume,
        isMuted: this.state.muted,
        isLooping: this.state.loopingType,
      };

      try {
        if (this._isMounted) {
          await this._video.loadAsync(source, initialStatus);
          this.playbackInstance = this._video;
          this._updateScreenForLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  _mountVideo = (component) => {
    this._video = component;
    this._loadNewPlaybackInstance(true);
  };

  _updateScreenForLoading(isLoading) {
    if (isLoading) {
      this.setState({
        isPlaying: false,
        playbackInstanceDuration: null,
        playbackInstancePosition: null,
        isLoading: true,
      });
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  _onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      this.setState({
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        loopingType: status.isLooping,
        shouldCorrectPitch: status.shouldCorrectPitch,
      });
      if (status.didJustFinish && !status.isLooping) {
        this._advanceIndex();
        this._updatePlaybackInstanceForIndex(true);
      }
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _advanceIndex() {
    const { index, playlist, timeToGamePrompt, showCountdown } = this.state;
    const { updateCampaign, updateMediaPlays } = this.props;
    const isLastIndex = index + 1 === playlist.length;

    if (playlist[index].contentType === "campaign") {
      updateCampaign(playlist[index].resourceRef.id, {
        impressions: 1,
        playTimeInSeconds: playlist[index].durationInSeconds,
      });
    } else if (playlist[index].contentType === "non-campaign") {
      updateMediaPlays(playlist[index].resourceRef.id, { plays: 1 });
    }

    const updatedIdx = isLastIndex ? 0 : index + 1;

    this.setState({
      index: updatedIdx,
      timeToGamePrompt: timeToGamePrompt + playlist[index].durationInSeconds,
      ...(showCountdown && { showCountdown: false }),
    });
    return AsyncStorage.setItem(
      "playlistIndex",
      JSON.stringify({ atIndex: updatedIdx })
    );
  }

  async _updatePlaybackInstanceForIndex(playing) {
    this._updateScreenForLoading(true);
    this._loadNewPlaybackInstance(playing);
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    return totalSeconds;
  }

  render() {
    if (this.state.playlist.length === 0) {
      return <View style={styles.nonPlaylist}></View>;
    }
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.videoContainer,
            {
              width: this.props.videoWidth,
              height: this.props.videoHeight,
            },
          ]}
        >
          <Video
            ref={this._mountVideo}
            resizeMode="cover"
            style={{
              width: this.props.videoWidth,
              height: this.props.videoHeight,
              position: "absolute",
              top: 0,
              right: 0,
              left: 0,
              alignItems: "stretch",
              opacity: this.state.isLoading ? 0.5 : 1,
            }}
            onPlaybackStatusUpdate={this._onPlaybackStatusUpdate}
          />
          <View style={{ alignItems: "center", flexDirection: "column" }}>
            <View>{this.state.isLoading ? <LoaderAnimation /> : null}</View>
          </View>
          {this.state.showCountdown ? (
            <View style={styles.adCountdown}>
              <Text style={styles.countdownText}>
                Ad starts in {this.state.toAdCounter}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  nonPlaylist: {
    backgroundColor: "#222",
    flex: 1,
  },
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#222",
  },
  adCountdown: {
    backgroundColor: "#262525",
    position: "absolute",
    bottom: hp("22%"),
    right: wp("5%"),
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("2.5%"),
  },
  countdownText: {
    color: "#fff",
    fontSize: hp("4.2%"),
  },
});
