"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { processClips } from "./lib/pythonService";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clipLength, setClipLength] = useState(5);
  const [file, setFile] = useState("");
  const [adFill, setAdFill] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAttached, setIsAttached] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title === "" || file === "") {
      toast.error("Please fill out all fields");
      return;
    }
    setLoading(true);

    const answerRes = await processClips(title, clipLength, file, adFill);

    if (answerRes.status === 200) {
      router.push("/clips");
      return;
    }
    console.error("Failed to generate clips:", answerRes.statusText);
    setLoading(false);
  };

  const handleAttachClick1 = () => {
    fileInputRef1.current.click();
  };

  const handleAttachClick2 = () => {
    fileInputRef2.current.click();
  };

  const handleFileChange = (files, fileNum) => {
    if (fileNum === 1) setFile(files?.[0] ?? "");
    else setAdFill(files?.[0] ?? "");
    if (fileNum === 1 && (files?.[0] == "" || files?.[0] == null)) {
      setIsAttached(false);
    } else {
      setIsAttached(true);
    }
  };

  return (
    <div className="h-screen">
      <Toaster />
      <div className="flex w-1/2 max-h-[75%] h-[100%] mx-auto justify-center items-center">
        <div className="flex flex-col gap-10">
          <p className="flex justify-center my-4 font-bold text-xl">
            Brain Rot-erator
          </p>
          <form
            className="flex flex-col space-y-4 gap-5"
            onSubmit={() => handleSubmit()}
          >
            <div className="flex items-center flex-col">
              <button
                type="button"
                onClick={() => handleAttachClick1()}
                data-testid="attachMovie"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded flex w-fit"
              >
                Attach movie
              </button>

              <input
                type="file"
                ref={fileInputRef1}
                style={{ display: "none" }}
                multiple={false}
                onChange={(e) => handleFileChange(e.target.files, 1)}
                data-testid="attachMovieInput"
                accept="video/mp4,video/x-m4v,video/*"
              />
              <p className="flex items-center  text-blue-500 py-3">
                {file.name}
              </p>
            </div>
            {isAttached && (
              <div className="flex flex-col space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="Enter movie title here..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none text-black"
                  />
                  <div className="flex">
                    <select
                      value={clipLength}
                      onChange={(e) => setClipLength(e.target.value)}
                      data-testid="clipLength"
                      className="border border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none text-black self-center"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                    </select>
                    <p className="flex items-center px-4">Clip length (secs)</p>
                  </div>
                </div>
                <p className="flex justify-center pt-10 font-bold">Options</p>
                <div className="flex items-center flex-col">
                  <button
                    type="button"
                    onClick={() => handleAttachClick2()}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded flex w-fit"
                  >
                    Attach ad-fill
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef2}
                    style={{ display: "none" }}
                    multiple={false}
                    onChange={(e) => handleFileChange(e.target.files, 2)}
                    data-testid="attachAdFillInput"
                    accept="video/mp4,video/x-m4v,video/*"
                  />
                  <p className="flex items-center text-blue-500 py-3 h-[48px]">
                    {adFill.name}
                  </p>
                </div>
                <div className="flex pt-10 justify-center">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-center"
                    onClick={(e) => handleSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center h-[48px]">
              {loading && (
                <CircularProgress
                  data-testid="progressbar"
                  className="flex justify-center"
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
