import { useEffect } from "react";
import { checkAndRemoveExpiredClips } from "../utils";

const useExpiredClipsCheck = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Checking for expired clips");
      checkAndRemoveExpiredClips();
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);
};

export default useExpiredClipsCheck;
