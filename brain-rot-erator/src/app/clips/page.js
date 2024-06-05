"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import io from "socket.io-client";
import { sortedVideos, checkAndRemoveExpiredClips, delete_clip } from "./utils";

const useExpiredClipsCheck = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndRemoveExpiredClips();
    }, 10000);

    return () => clearInterval(interval);
  }, []);
};

export default function ClipsPage() {
  useExpiredClipsCheck();
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
      setVideos(sortedVideos(videoUrls));
    } else {
      console.error("Failed to fetch videos:", response.statusText);
    }
    setIsLoading(false);

    toast(
      (t) => (
        <div className="flex flex-col items-center gap-2">
          <span>
            <b>WARNING: </b>your clips will be DELETED in ONE HOUR if you
            don&apos;t download them
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
      ),
      {
        duration: Infinity,
      }
    );
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
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = videoUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await delete_clip(videoUrl); //TODO: this needs to delete from localStorage if not already
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video !== videoUrl)
      );
    }
    setSelected([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="h-screen max-w-screen w-100 m-auto">
      <Toaster />
      <div className="w-1/2 m-auto">
        <div className="flex flex-row justify-center p-10">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
            onClick={(e) => handleReturnClick(e)}
          >
            Return
          </button>

          <div className="flex">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-2 rounded self-center w-24 fixed top-8 right-[30%] z-50"
              onClick={() => handleDownloadSelected()}
            >
              Download selected
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          {videos?.length > 0 &&
            videos.map((videoUrl, videoIndex) => (
              <div
                key={videoUrl}
                url={videoUrl}
                className="flex items-center gap-2 flex-col border-2 border-gray-300 p-2"
              >
                <video data-testid={videoUrl} controls width="250">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser doesn&apos;t support the video tag.
                </video>
                <div className="flex justify-between w-full border-[1px] border-gray-300">
                  <span className="ml-3">{videoUrl.split("/")[5]}</span>
                  <input
                    type="checkbox"
                    onChange={() => handleSelection(videoUrl)}
                    checked={selected.includes(videoUrl)}
                    className="mr-3"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
