export async function getClips(title, clipLength, fileName) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("clipLength", clipLength);
  formData.append("fileName", fileName);

  try {
    const response = await fetch("http://localhost:5000/api/clips", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response;
  } catch (error) {
    console.error("Error submitting API request:", error);
  }
}
