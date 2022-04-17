import { useContext, useEffect } from "react";
import { Context as DriverContext } from "../context/DriverContext";
import { Context as StreamingContext } from "../context/StreamingContext";
import { customNavigate } from "../navigationRef";

export default () => {
  const {
    state: { user, error },
    getUser,
  } = useContext(DriverContext);
  const {
    state: { streamingStatus },
  } = useContext(StreamingContext);

  useEffect(() => {
    if (user) {
      streamingStatus === "off"
        ? customNavigate("NoActivity")
        : customNavigate("Welcome");
    }
  }, [user, streamingStatus]);

  const signinAndNavigate = (signinFunc, data) => {
    if (!data) {
      signinFunc(getUser);
    } else {
      signinFunc(data, getUser);
    }
  };

  return [signinAndNavigate, error];
};
