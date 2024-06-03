const extractTime = (videoUrl) => {
  const timeRegex = /-(\d{2}.\d{2}.\d{2})/;
  const time = videoUrl.match(timeRegex);
  return time ? time[1] : null; // what is time[1]
};

const parseTime = (time) => {
  console.log("time", time);
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

export { extractTime, parseTime, sortedVideos };
