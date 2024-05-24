export async function processClips(title, clipLength, file, adFill) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("clipLength", clipLength);
  formData.append("file", file); //is this actually a File object?
  formData.append("adFill", adFill);

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

    const responseData = await response.json(); //responseData.status could be 'error' if the js program has a problem parsing the response with response.json()
    return { status: response.status, data: responseData }; //Have to return the status of response and not responseData cuz then it's just a string
  } catch (error) {
    console.error("Error parsing response:", error);
    return { status: "network-error", error }; //returns network-error as status code and error as data
  }
}
