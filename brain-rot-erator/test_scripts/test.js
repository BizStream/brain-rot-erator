import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../src/app/page.js"; // Adjust the path to where Home component is located
import { processClips } from "../src/app/lib/pythonService"; // Ensure the path is correct
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Mock dependencies
jest.mock("../src/app/lib/pythonService");
jest.mock("react-hot-toast");
jest.mock("next/navigation");

describe("Home Component", () => {
  it("should fill the title input with correct text", async () => {
    render(<Home />);
    const titleInput = screen.getByPlaceholderText("Enter movie title here...");

    // Simulate user typing a title
    await userEvent.type(titleInput, "Inception"); //needed to make this async
    expect(titleInput.value).toBe("Inception");
  });
});

// describe("Home Component", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should allow entering a movie title", () => {
//     render(<Home />);
//     const titleInput = screen.getByPlaceholderText("Enter movie title here...");
//     userEvent.type(titleInput, "Inception");
//     expect(titleInput.value).toBe("Inception");
//   });

//   it("should handle file attachment for movie", () => {
//     render(<Home />);
//     const fileInput = screen.getByLabelText("Attach movie");
//     const file = new File(["movie"], "movie.mp4", { type: "video/mp4" });
//     userEvent.upload(fileInput, file);
//     expect(screen.getByText("movie.mp4")).toBeInTheDocument();
//   });

//   it("should handle file attachment for ad-fill", () => {
//     render(<Home />);
//     const fileInput = screen.getByLabelText("Attach ad-fill");
//     const file = new File(["ad"], "ad.mp4", { type: "video/mp4" });
//     userEvent.upload(fileInput, file);
//     expect(screen.getByText("ad.mp4")).toBeInTheDocument();
//   });

//   it("should allow selecting a clip length", () => {
//     render(<Home />);
//     const select = screen.getByLabelText("Clip length (secs)");
//     userEvent.selectOptions(select, "15");
//     expect(select.value).toBe("15");
//   });

//   it("should show loading indicator and process clips on form submission", async () => {
//     processClips.mockResolvedValue({ status: 200 });
//     render(<Home />);
//     userEvent.type(
//       screen.getByPlaceholderText("Enter movie title here..."),
//       "Inception"
//     );
//     userEvent.click(screen.getByText("Submit"));

//     await waitFor(() => {
//       expect(screen.getByRole("progressbar")).toBeInTheDocument();
//       expect(processClips).toHaveBeenCalled();
//     });
//   });

//   it("should display error toast when fields are incomplete and submit is attempted", () => {
//     render(<Home />);
//     userEvent.click(screen.getByText("Submit"));
//     expect(toast.error).toHaveBeenCalledWith("Please fill out all fields");
//   });
// });
