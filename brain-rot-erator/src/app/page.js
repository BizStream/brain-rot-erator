"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getClips } from "./lib/pythonService";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clipLength, setClipLength] = useState(5);
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title === "" || file === "") {
      toast.error("Please fill out all fields");
      return;
    }
    setLoading(true);

    const answerRes = await getClips(title, clipLength, file);

    if (answerRes.status === 200) {
      router.push("/clips");
    }
    console.error("Failed to generate clips:", answerRes.statusText);
    setLoading(false);
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (files) => {
    setFile(files?.[0] ?? "");
  };

  return (
    <div>
      <Toaster />
      <div className="flex max-w-900 mx-auto w-full justify-center">
        <div className="flex flex-col">
          <p className="flex justify-center my-4 font-bold">Brain Rot-erator</p>
          <form
            className="flex flex-col space-y-4"
            onSubmit={() => handleSubmit()}
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
                  onClick={() => handleAttachClick()}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded flex w-fit"
                >
                  Attach mp4
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  multiple={false}
                  onChange={(e) => handleFileChange(e.target.files)}
                  accept="video/mp4,video/x-m4v,video/*"
                />
                <p className="flex items-center px-4 text-blue-500">
                  {file.name}
                </p>
              </div>

              <div className="flex">
                <p className="flex items-center px-4">Clip length (secs)</p>
                <select
                  value={clipLength}
                  onChange={(e) => setClipLength(e.target.value)}
                  className="border border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none text-black self-center"
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
              {loading && <CircularProgress className="flex justify-center" />}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
