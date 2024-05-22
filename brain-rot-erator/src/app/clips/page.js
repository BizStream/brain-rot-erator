"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

export default function ClipsPage() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    toast((t) => (
      <div className="flex flex-col items-center gap-2">
        <span>
          <b>WARNING: </b>your clips will be DELETED in ONE HOUR if you don't
          download them
        </span>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
          onClick={() => {
            toast.dismiss(t.id);
          }}
        >
          Dismiss
        </button>
      </div>
    ));
  }, []);

  useEffect(() => {
    const fetchVideoUrls = async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_PATH_TO_URLS);
      if (response.ok) {
        const videoUrls = await response.json();
        setVideos(videoUrls);
      } else {
        console.error("Failed to fetch videos:", response.statusText);
      }
    };

    fetchVideoUrls();
  }, []);

  const handleReturnClick = (e) => {
    e.preventDefault();
    router.push("/");
  };

  const handleSelection = (index) => {
    setSelected((prevSelected) => {
      const newIndex = prevSelected.indexOf(index);
      if (newIndex === -1) {
        return [...prevSelected, index];
      } else {
        return prevSelected.filter((i) => i !== index);
      }
    });
  };

  //TODO: figure out better way to call delete after file has been downloaded
  //TODO: endpoint for viewing the links and then endpoint to download and the delete the links after they've been downloaded?
  const handleDownloadSelected = async () => {
    selected.forEach(async (videoUrl) => {
      //waits for one video to download before moving on to the next one
      const video = videoUrl;

      const link = document.createElement("a"); //creates a new anchor element in the DOM
      link.href = video; //href is a property of the anchor element
      link.download = video.split("/").pop();
      document.body.appendChild(link); //attaches the anchor element to the body of the document even though it's not visible
      link.click();
      document.body.removeChild(link);
      await new Promise((resolve) => setTimeout(resolve, 1000)); //waits for 1 second before moving on to the delete_clip function

      await delete_clip(video); //loop will wait for this function to complete before moving on to the next iteration
    });
    setSelected([]);
  };

  const delete_clip = async (filepath) => {
    let filename = filepath.split("/").pop();
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_PATH_TO_DELETE_CLIP,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filename }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        const responseData = await response.json();
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video !== filepath)
        );
        return { status: response.status, data: responseData };
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      return { status: "network-error", error };
    }
  };

  return (
    <div className="h-screen max-w-screen w-1/2 m-auto">
      <Toaster />
      <div className="flex flex-row">
        <div className="flex flex-row w-[90%]">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
            onClick={(e) => handleReturnClick(e)}
          >
            Return
          </button>
          <div className="w-full">
            <h1 className="flex justify-center my-4 font-bold">Your Clips!</h1>
          </div>
          <div className="flex">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-2 rounded self-center mt-2"
              onClick={() => handleDownloadSelected()}
            >
              Download selected
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 w-[80%]">
        {videos?.length > 0 &&
          videos.map((videoUrl, videoIndex) => (
            <div
              key={videoUrl}
              url={videoUrl}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                onChange={() => handleSelection(videoUrl)}
                checked={selected.includes(videoUrl)}
              />
              <video controls width="250">
                <source src={videoUrl} type="video/mp4" />
                Your browser doesn't support the video tag.
              </video>
            </div>
          ))}
      </div>
    </div>
  );
}
