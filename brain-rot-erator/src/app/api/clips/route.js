import fs from "fs";
import path from "path";

export async function GET(Request) {
  const videoDirectory = path.join(process.cwd(), "temporary_folder/clips");
  const files = fs.readdirSync(videoDirectory);
  console.log("still used");
  const videoFiles = files.filter((file) => file.endsWith(".mp4"));

  return Response.json(videoFiles, { status: 200, videoFiles });
}

export async function DELETE(Request) {
  const videoDirectory = path.join(process.cwd(), "public/videos");
  const files = fs.readdirSync(videoDirectory);
  const videoFiles = files.filter((file) => file.endsWith(".mp4"));

  videoFiles.forEach((file) => {
    const filePath = path.join(videoDirectory, file);
    fs.unlinkSync(filePath);
  });

  return Response.json("Deleted all clips", { status: 200 });
}
