import { delete_clip } from "./lib/pythonService";

const extractTime = (videoUrls) => {
  const keys = Object.keys(localStorage);
  let clipTimes = new Array(videoUrls.length).fill(null);

  for (let key of keys) {
    const storedItem = localStorage.getItem(key);
    try {
      const clip = JSON.parse(storedItem); // have to parse the data in each object first

      videoUrls.forEach((videoUrl, index) => {
        if (clip && videoUrl.includes(clip.clipName)) {
          //TODO: is the second check unnecessary? Could potentially change the clipNames
          clipTimes[index] = clip.createdAt;
        }
      });
    } catch (error) {
      console.error("Error parsing clip createdAt:", error);
    }
  }

  return clipTimes;
};

const sortedVideos = (videoUrls) => {
  const clipTimes = extractTime(videoUrls);

  return videoUrls
    .map((url, index) => ({ url, time: new Date(clipTimes[index]) })) //temp array that stores url and time
    .sort((a, b) => {
      if (isNaN(a.time) || isNaN(b.time)) {
        console.error("Invalid Date:", a.time, b.time);
        return 0; // Keep original order if dates are invalid
      }

      return b.time - a.time; // Descending order
    })
    .map((item) => item.url); // map temp array back to original array
};

const checkAndRemoveExpiredClips = () => {
  Object.keys(localStorage).forEach((key) => {
    try {
      const clip = JSON.parse(localStorage.getItem(key));

      if (clip && clip.expiresAt) {
        const expiresAt = new Date(clip.expiresAt);
        const now = new Date();
        if (now > expiresAt) {
          localStorage.removeItem(key);
          console.log(`Removed expired clip from localStorage: ${key}`);

          delete_clip(clip.clipPath, false);
        }
      }
    } catch (error) {
      console.error("Error parsing clip:", error);
    }
  });
};

const deleteClipFromLocal = (videoUrl) => {
  const keys = Object.keys(localStorage);

  for (let key of keys) {
    const storedItem = localStorage.getItem(key);
    try {
      const clip = JSON.parse(storedItem);

      if (clip && videoUrl.includes(clip.clipName)) {
        localStorage.removeItem(key);
        console.log(`Removed clip from localStorage: ${key}`);
      }
    } catch (error) {
      console.error("Error parsing clip:", error);
    }
  }
};

export {
  extractTime,
  sortedVideos,
  checkAndRemoveExpiredClips,
  deleteClipFromLocal,
};
