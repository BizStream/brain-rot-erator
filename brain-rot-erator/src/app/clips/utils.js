const extractTime = (videoUrl) => {
  const timeRegex = /-(\d{2}.\d{2}.\d{2})/;
  const time = videoUrl.match(timeRegex);
  return time ? time[1] : null; // what is time[1]
};

const parseTime = (time) => {
  const [hours, minutes, seconds] = time.split(".");
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
};

const sortedVideos = (videoUrls) => {
  return videoUrls.sort((a, b) => {
    const timeA = extractTime(a);
    const timeB = extractTime(b);
    return parseTime(timeB) - parseTime(timeA);
  });
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
          console.log(`Removed expired clip: ${key}`);

          delete_clip(clip.clipPath.split("/").pop());
          //TODO: update setVideos to remove the clip from the list
        }
      }
    } catch (error) {
      console.error("Error parsing clip:", error);
    }
  });
};

const delete_clip = async (filepath) => {
  let filename = filepath.split("\\").pop();
  console.log("filename: ", filename);
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_PATH_TO_DELETE_CLIP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    } else {
      const responseData = await response.json();
      return { status: response.status, data: responseData };
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    return { status: "network-error", error };
  }
};

export {
  extractTime,
  parseTime,
  sortedVideos,
  checkAndRemoveExpiredClips,
  delete_clip,
};
