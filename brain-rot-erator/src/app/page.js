"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getClips } from "./lib/pythonService";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { CircularProgress, LinearProgress } from "@mui/material";

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clipLength, setClipLength] = useState(5);
  const [file, setFile] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title === "" || file === "") {
      toast.error("Please fill out all fields");
      setResponse("");
      return;
    }
    setLoading(true);

    const answerRes = await getClips(title, clipLength, file);

    if (answerRes.status === 200) {
      setResponse(answerRes.data);
      router.push("/clips");
      setTitle("");
      setClipLength(5);
    } else if (answerRes.status === "network-error") {
      console.log("Network error:", answerRes.error);
    } else {
      console.log("Error");
    }
  };

  const handleAttachClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (files) => {
    if (files.length === 0) {
      setFile("");
      return;
    }
    const fileInput = files[0];
    setFile(fileInput);
  };

  return (
    <div className="">
      <Toaster></Toaster>
      <div className="flex max-w-900 mx-auto w-full justify-center">
        <div className="flex flex-col">
          <p className="flex justify-center my-4 font-bold">Brain Rot-erator</p>
          <form
            className="flex flex-col space-y-4"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex">
                <p className="flex items-center px-4">Movie title</p>
                <input
                  type="text"
                  placeholder="Enter movie title here..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none text-black"
                />
              </div>

              <div className="flex">
                <button
                  type="button"
                  onClick={(e) => handleAttachClick(e)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded flex w-fit"
                >
                  Attach mp4
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e.target.files)}
                  accept="video/mp4,video/x-m4v,video/*"
                ></input>
                <p className="flex items-center px-4 text-blue-500">
                  {file.name}
                </p>
              </div>

              <div className="flex">
                <p className="flex items-center px-4">Clip length (secs)</p>
                <select
                  value={clipLength}
                  onChange={(e) => setClipLength(e.target.value)}
                  class="border border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none text-black self-center"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
              onClick={(e) => handleSubmit(e)}
            >
              Submit
            </button>
            <div
              className="flex justify-center
          "
            >
              {loading && (
                <CircularProgress className="flex justify-center"></CircularProgress>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
