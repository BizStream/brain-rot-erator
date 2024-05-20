"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import List from "react-list-select";

export default function ClipsPage() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await fetch("/api/test");

      const data = await response.json();
      setVideos(data);
    };

    fetchVideos();
  }, []);

  const handleReturnClick = (e) => {
    e.preventDefault();

    // After videos are deleted for the first time (length === 0), the next time you come to this page it redirects you home BUT TODO: the toast still pops up for a split second
    if (videos.length === 0) {
      router.push("/");
    } else {
      toast((t) => (
        <span className="">
          Are you sure? <b className="text-2xl">Your clips will be DELETED</b>
          <button
            className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
            onClick={() => {
              toast.dismiss(t.id);
              handleWarningClick();
            }}
          >
            Confirm
          </button>
        </span>
      ));
    }
  };

  const handleWarningClick = () => {
    const deleteClips = async () => {
      const response = await fetch("/api/test", {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
      }
    };

    deleteClips();
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

    console.log("Selected:", selected);
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
      <Toaster></Toaster>
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
        {videos.map((video, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(index)}
              onChange={() => handleSelection(index)}
            />
            <video controls width="250">
              <source src={`/videos/${video}`} type="video/mp4" />
              Your browser doesn't support the video tag.
            </video>
          </div>
        ))}
      </ul>
    </div>
  );
}
