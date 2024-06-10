import { sortedVideos } from "../utils";

export async function processClips(title, clipLength, file, adFill) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("clipLength", clipLength);
  formData.append("file", file);
  formData.append("adFill", adFill || "");

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_PATH_TO_PROCESS_VIDEO,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error("Error parsing response:", error);
    return { status: "network-error", error };
  }
}

export async function fetchVideoUrls() {
  const response = await fetch(process.env.NEXT_PUBLIC_PATH_TO_URLS);
  if (response.ok) {
    const videoUrls = await response.json();
    const sorted = sortedVideos(videoUrls);
    console.log("sortedVideos", sorted);
    return sorted;
  } else {
    console.error("Failed to fetch videos:", response.statusText);
  }
}

export async function delete_clip(filepath, isDownloadLink = false) {
  let filename = filepath.split("\\").pop();
  if (isDownloadLink) {
    filename = filepath.split("/").pop();
  }
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
}
