import createDataContext from "./createDataContext";
import adverts247Api from "../api/adverts247Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UPDATING_MEDIA_PLAYS = "updating_media_plays";
const UPDATE_MEDIA_SUCCESS = "update_media_success";
const UPDATE_MEDIA_FAIL = "update_media_fail";

const vodReducer = (state, action) => {
  switch (action.type) {
    case UPDATING_MEDIA_PLAYS:
      return { ...state, updatingMediaPlays: action.payload };
    case UPDATE_MEDIA_SUCCESS:
      return { ...state, updateMediaSuccess: action.payload };
    case UPDATE_MEDIA_FAIL:
      return { ...state, updateMediaError: action.payload };
    case "get_entertain_contents":
      return {
        ...state,
        mediaList: { ...state.mediaList, videos: action.payload },
      };
    case "get_ad_contents":
      return {
        ...state,
        mediaList: { ...state.mediaList, ads: action.payload },
      };
    case "set_error":
      return { ...state, error: action.payload };
    case "save_played_idx":
      return { ...state, entertainPlayedIdx: action.payload };
    case "save_played_ads":
      return { ...state, adsPlayedIdx: action.payload };
    case "clear_history":
      return { ...state, entertainPlayedIdx: [], adsPlayedIdx: [] };
    default:
      return state;
  }
};

/**
 * @deprecated (not used in v2)
 */
const getEntertainContent = (dispatch) => async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.get(
      "/mediaBucket/prefix/vod-247bucket",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: "get_entertain_contents",
      payload: response.data,
    });
  } catch (err) {
    dispatch({
      type: "set_error",
      payload: err,
    });
  }
};

/**
 * @deprecated (not used in v2)
 */
const getAdContent = (dispatch) => async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.get(
      "/mediaBucket/prefix/247-adverts-mediabucket",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: "get_ad_contents",
      payload: response.data,
    });
  } catch (err) {
    dispatch({
      type: "set_error",
      payload: err,
    });
  }
};

/**
 * @deprecated (not used in v2)
 */
const savePlayedIdx = (dispatch) => (idxArray) => {
  dispatch({
    type: "save_played_index",
    payload: idxArray,
  });
};

/**
 * @deprecated (not used in v2)
 */
const savePlayedAdsIdx = (dispatch) => (idxArray) => {
  dispatch({
    type: "save_played_ads",
    payload: idxArray,
  });
};

/**
 * @deprecated (not used in v2)
 */
const clearPlaylistHistory = (dispatch) => () => {
  // console.log('clear works', 3);
  dispatch({
    type: "clear_history",
  });
};

const updateMediaItemPlays = (dispatch) => async (mediaId, data, cb) => {
  dispatch({ type: UPDATING_MEDIA_PLAYS, payload: true });
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.patch(
      `/mediaitems/plays/${mediaId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({ type: UPDATING_MEDIA_PLAYS, payload: false });
    dispatch({ type: UPDATE_MEDIA_SUCCESS, payload: response.data.message });
    cb && cb();
  } catch (err) {
    if (err.response) {
      dispatch({
        type: UPDATE_MEDIA_FAIL,
        payload:
          err.response.data.message ||
          "Unable to update media item. Something went wrong",
      });
    } else {
      dispatch({
        type: UPDATE_MEDIA_FAIL,
        payload: "Unable to update media item. Something went wrong",
      });
    }
    dispatch({ type: UPDATING_MEDIA_PLAYS, payload: false });
  }
};

export const { Context, Provider } = createDataContext(
  vodReducer,
  {
    getEntertainContent,
    getAdContent,
    savePlayedIdx,
    savePlayedAdsIdx,
    clearPlaylistHistory,
    updateMediaItemPlays,
  },
  {
    updatingMediaPlays: false,
    updateMediaSuccess: null,
    updateMediaError: null,
    mediaList: { videos: [], ads: [] },
    entertainPlayedIdx: [],
    adsPlayedIdx: [],
    error: null,
  }
);
