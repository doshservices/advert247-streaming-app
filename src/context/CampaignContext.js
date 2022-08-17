import createDataContext from "./createDataContext";
import adverts247Api from "../api/adverts247Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UPDATING_CAMPAIGN_STAT = "updating_campaign_stat";
const SET_UPDATE_STAT_ERROR = "set_update_stat_error";

const campaignReducer = (state, action) => {
  switch (action.type) {
    case UPDATING_CAMPAIGN_STAT:
      return { ...state, updatingCampaignStat: action.payload };
    case SET_UPDATE_STAT_ERROR:
      return { ...state, updateStatError: action.payload };
    default:
      return state;
  }
};

const updateCampaignStat = (dispatch) => async (campaignId, data, cb) => {
  dispatch({ type: UPDATING_CAMPAIGN_STAT, payload: true });
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.patch(
      `/campaigns/stats/${campaignId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch({ type: UPDATING_CAMPAIGN_STAT, payload: false });
    cb && cb();
  } catch (err) {
    if (err.response) {
      dispatch({
        type: SET_UPDATE_STAT_ERROR,
        payload:
          err.response.data.message ||
          "Unable to update campaign stat. Something went wrong",
      });
    } else {
      dispatch({
        type: SET_UPDATE_STAT_ERROR,
        payload: "Unable to update campaign stat. Something went wrong",
      });
    }
    dispatch({ type: UPDATING_CAMPAIGN_STAT, payload: false });
  }
};

export const { Context, Provider } = createDataContext(
  campaignReducer,
  { updateCampaignStat },
  { updatingCampaignStat: false, updateStatError: null }
);
