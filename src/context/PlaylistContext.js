import createDataContext from "./createDataContext";
import adverts247Api from "../api/adverts247Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const playlistReducer = (state, action) => {
  switch (action.type) {
    case "fetching_general_playlist":
      return { ...state, fetchingGeneralPlaylist: action.payload };
    case "set_general_playlist":
      return { ...state, generalPlaylist: action.payload };
    case "fetch_general_playlist_error":
      return { ...state, fetchGeneralPlaylistErr: action.payload };
    default:
      return state;
  }
};

const fetchGeneralPlaylist = (dispatch) => async () => {
  dispatch({ type: "fetching_general_playlist", payload: true });
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.get("/playlists", {
      headers: { Authorization: `Bearer ${token}` },
      params: { name: "general" },
    });

    dispatch({ type: "fetching_general_playlist", payload: false });
    dispatch({
      type: "set_general_playlist",
      payload: response.data.playlist.queue,
    });
  } catch (err) {
    if (err.response) {
      dispatch({
        type: "fetch_general_playlist_error",
        payload:
          err.response.data.message ||
          "Unable to fetch playlist. Something went wrong",
      });
    } else {
      dispatch({
        type: "fetch_general_playlist_error",
        payload: "Unable to fetch playlist. Something went wrong",
      });
    }
    dispatch({ type: "fetching_general_playlist", payload: false });
  }
};

export const { Context, Provider } = createDataContext(
  playlistReducer,
  { fetchGeneralPlaylist },
  {
    fetchingGeneralPlaylist: false,
    generalPlaylist: [],
    fetchGeneralPlaylistErr: null,
  }
);
