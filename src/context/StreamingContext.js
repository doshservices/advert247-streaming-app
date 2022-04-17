import createDataContext from "./createDataContext";
import adverts247Api from "../api/adverts247Api";
import AsyncStorage from '@react-native-async-storage/async-storage'

const streamingReducer = (state, action) => {
  switch (action.type) {
    case "set_streaming_status":
      return { ...state, streamingStatus: action.payload };
    case "set_error":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const getStreamingStatus = (dispatch) => async (driverId, cancelTokn) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.get(`/stream/${driverId}`, {
      cancelToken: cancelTokn,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    dispatch({
      type: "set_streaming_status",
      payload: response.data.data.streamStatus,
    });
  } catch (err) {
    dispatch({
      type: "set_error",
      payload: err.message,
    });
  }
};

export const { Context, Provider } = createDataContext(
  streamingReducer,
  { getStreamingStatus },
  { streamingStatus: "off", error: "" }
);
