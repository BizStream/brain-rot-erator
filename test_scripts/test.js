import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../src/app/page.js"; // Adjust the path to where Home component is located
import { processClips } from "../src/app/services/pythonService.js"; // Ensure the path is correct
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../src/app/lib/pythonService", () => ({
  processClips: jest.fn(() => Promise.resolve({ status: 200 })),
}));
jest.mock("react-hot-toast");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe("Home Component", () => {
  it("should fill the title input with correct text", async () => {
    render(<Home />);
    const titleInput = screen.getByPlaceholderText("Enter movie title here...");

    // Simulate user typing a title
    await userEvent.type(titleInput, "Inception"); //needed to make this async
    expect(titleInput.value).toBe("Inception");
  });

  it("should handle file attachment for movie", async () => {
    render(<Home />);
    const fileUpload = screen.getByTestId("attachMovie"); //button
    const fileInput = screen.getByTestId("attachMovieInput"); //file input label
    const file = new File(["movie"], "movie.mp4", { type: "video/mp4" });

    // Simulate user uploading a file
    await userEvent.upload(fileInput, file); //gotta be async cuz DOM element loading dynamically
    expect(screen.getByText("movie.mp4")).toBeInTheDocument();
  });

  it("should handle file attachment for ad-fill", async () => {
    render(<Home />);
    const fileInput = screen.getByTestId("attachAdFillInput");
    const file = new File(["ad"], "ad.mp4", { type: "video/mp4" });

    // Simulate user uploading a file
    await userEvent.upload(fileInput, file);
    expect(screen.getByText("ad.mp4")).toBeInTheDocument();
  });

  it("should allow selecting a clip length", async () => {
    render(<Home />);
    const select = screen.getByTestId("clipLength"); //select element

    // Simulate user selecting an option
    await userEvent.selectOptions(select, "15");
    expect(select.value).toBe("15");
  });

  it("should display error toast when fields are incomplete and submit is attempted", async () => {
    render(<Home />);
    await userEvent.click(screen.getByText("Submit"));
    expect(toast.error).toHaveBeenCalledWith("Please fill out all fields");
  });

  it("should show loading indicator and process clips on form submission", async () => {
    render(<Home />);
    const submitButton = screen.getByText("Submit");

    // fill out fields
    const titleInput = screen.getByPlaceholderText("Enter movie title here...");
    await userEvent.type(titleInput, "Inception");
    const fileInput = screen.getByTestId("attachMovieInput"); //file input label
    const file = new File(["movie"], "movie.mp4", { type: "video/mp4" });
    await userEvent.upload(fileInput, file);

    // Simulate user submitting the form
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByTestId("progressbar")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(processClips).toHaveBeenCalled();
    });
  });
});
