export async function processClips(title, clipLength, file, adFill) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("clipLength", clipLength);
  formData.append("file", file);
  if (adFill && adFill !== "") {
    formData.append("adFill", adFill);
  }

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
