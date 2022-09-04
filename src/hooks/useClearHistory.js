import { useContext } from "react";
import { Context as RiderContext } from "../context/RiderContext";
import { Context as TriviaContext } from "../context/TriviaContext";

export default () => {
  const { clearRider } = useContext(RiderContext);
  const { clearQuizHistory } = useContext(TriviaContext);

  const clearHistory = () => {
    // console.log('clear works');
    clearRider();
    clearQuizHistory();
  };

  return [clearHistory];
};
