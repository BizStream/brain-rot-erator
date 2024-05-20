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
      <span>
        <b>WARNING: </b>your clips will be DELETED in ONE HOUR if you don't
        download them
        <button
          className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
          onClick={() => {
            toast.dismiss(t.id);
          }}
        >
          Dismiss
        </button>
      </span>
    ));
    const fetchVideoUrls = async () => {
      const response = await fetch("http://localhost:5000/api/videos");
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

  const handleDownloadSelected = () => {
    selected.forEach((index) => {
      const video = videos[index];
      const link = document.createElement("a"); //creates a new anchor element in the DOM
      link.href = `/videos/${video}`; //href is a property of the anchor element
      link.download = video;
      document.body.appendChild(link); //attaches the anchor element to the body of the document even though it's not visible
      link.click();
      document.body.removeChild(link);
    });
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

      <ul className="flex flex-col items-center gap-5 w-[80%]">
        {videos.map((video, videoName) => (
          <div key={videoName} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(videoName)}
              onChange={() => handleSelection(videoName)}
            />
            <video controls width="250">
              <source src={videos[videoName]} type="video/mp4" />
              Your browser doesn't support the video tag.
            </video>
          </div>
        ))}
      </ul>
    </div>
  );
}
