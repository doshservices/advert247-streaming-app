import createDataContext from "./createDataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import adverts247Api from "../api/adverts247Api";

const triviaReducer = (state, action) => {
  switch (action.type) {
    case "get_quizzes":
      return { ...state, quizzes: action.payload };
    case "save_answered_idx":
      return { ...state, answeredQuiz: action.payload };
    case "set_current_session":
      return { ...state, currentTriviaSession: action.payload };
    case "clear_history":
      return { ...state, answeredQuiz: [], currentTriviaSession: null };
    case "set_error":
      return { ...state, error: action.payload };
    case "updating_multiple_attributes":
      return { ...state, updatingMultipleQuiz: action.payload };
    case "update_multiple_fail":
      return { ...state, updateMultipleQuizError: action.payload };
    default:
      return state;
  }
};

const getTriviaQuiz = (dispatch) => async () => {
  const token = await AsyncStorage.getItem("token");
  try {
    const response = await adverts247Api.get("/quizzes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: "get_quizzes",
      payload: response.data.quizzes,
    });
  } catch (err) {
    dispatch({
      type: "set_error",
      payload: err,
    });
  }
};

const setCurrentTriviaSession = (dispatch) => (sessionData) => {
  dispatch({
    type: "set_current_session",
    payload: sessionData,
  });
};

const saveAnsweredQuiz = (dispatch) => (answeredArr) => {
  dispatch({
    type: "save_answered_idx",
    payload: answeredArr,
  });
};

const updateMultipleQuizAttributes = (dispatch) => async (updates) => {
  dispatch({ type: "updating_multiple_attributes", payload: true });
  dispatch({ type: "update_multiple_fail", payload: null });
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await adverts247Api.patch(
      "/quiz/bulk",
      { updates },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    //log some info here
    dispatch({ type: "updating_multiple_attributes", payload: false });
  } catch (err) {
    if (err.response) {
      dispatch({
        type: "update_multiple_fail",
        payload:
          err.response.data.message ||
          "Unable to update the quizzes. Something went wrong",
      });
    } else {
      dispatch({
        type: "update_multiple_fail",
        payload: "Unable to update the quizzes. Something went wrong",
      });
    }
    dispatch({ type: "updating_multiple_attributes", payload: false });
  }
};

const clearQuizHistory = (dispatch) => () => {
  // console.log('clear works', 2);
  dispatch({
    type: "clear_history",
  });
};

export const { Context, Provider } = createDataContext(
  triviaReducer,
  {
    getTriviaQuiz,
    saveAnsweredQuiz,
    setCurrentTriviaSession,
    clearQuizHistory,
    updateMultipleQuizAttributes,
  },
  {
    quizzes: [],
    answeredQuiz: [],
    error: null,
    currentTriviaSession: null,
    updatingMultipleQuiz: false,
    updateMultipleQuizError: null,
  }
);
