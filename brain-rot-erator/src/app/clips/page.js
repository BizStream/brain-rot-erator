"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import io from "socket.io-client";

export default function ClipsPage() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const socket = io("http://localhost:5000/");

    socket.on("files_deleted", (data) => {
      toast.error(
        "Your clips have been deleted and will no longer download. Please refresh the page.",
        { duration: Infinity }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchVideoUrls();
  }, []);

  const fetchVideoUrls = async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_PATH_TO_URLS);
    if (response.ok) {
      const videoUrls = await response.json();
      setVideos(videoUrls);
    } else {
      console.error("Failed to fetch videos:", response.statusText);
    }
    setIsLoading(false);

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
  };

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

  const handleDownloadSelected = async () => {
    for (const videoUrl of selected) {
      // Fetch the video
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      // Create a link and download the video
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = videoUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      // Clean up the link
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      // Wait for a short period to ensure the download starts
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Delete the clip
      await delete_clip(videoUrl);
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

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
              <video data-testid={videoUrl} controls width="250">
                <source src={videoUrl} type="video/mp4" />
                Your browser doesn't support the video tag.
              </video>
            </div>
          ))}
      </div>
    </div>
  );
}
