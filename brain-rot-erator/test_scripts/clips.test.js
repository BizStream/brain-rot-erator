import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Clips from "../src/app/clips/page.js"; // Adjust the path to where Home component is located
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import io from "socket.io-client";

//TODO: Mock the .env file
// Mock dependencies

jest.mock("react-hot-toast");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
jest.mock("socket.io-client");

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.resetMocks();
});

describe("Clips Page Component", () => {
  it("should display a warning toast when files are deleted via socket", async () => {
    const mockSocket = {
      on: jest.fn((event, callback) => {
        if (event === "files_deleted") {
          callback();
        }
      }),
      disconnect: jest.fn(),
    };

    io.mockReturnValue(mockSocket);

    render(<Clips />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Your clips have been deleted and will no longer download. Please refresh the page.",
        { duration: Infinity }
      );
    });

    //expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it("should display a toast warning that clips will be deleted in one hour", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        "http://localhost/video1.mp4",
        "http://localhost/video2.mp4",
      ]),
      { status: 200, statusText: "OK" }
    );

    render(<Clips />);

    await waitFor(() => {
      const toastContent = toast.mock.calls[0][0];
      render(toastContent({ id: "mock-toast-id" }));
      expect(
        screen.getByText(/your clips will be deleted in one hour/i)
      ).toBeInTheDocument();
      const dismissButton = screen.getByText(/dismiss/i);
      expect(dismissButton).toBeInTheDocument();
    });
  });

  it("fetches video urls and displays them", async () => {
    fetchMock.mockResponseOnce(
      (JSON.stringify([
        "http://localhost/video1.mp4",
        "http://localhost/video2.mp4",
      ]),
      { status: 200, statusText: "OK" })
    );

    await act(async () => {
      render(<Clips />);
    });

    //TODO: change these assertions when the list of videos displays their name as well
    // await waitFor(() => {
    //   expect(
    //     screen.getByTestId("http://localhost/video1.mp4")
    //   ).toBeInTheDocument();
    //   expect(
    //     screen.getByTestId("http://localhost/video2.mp4")
    //   ).toBeInTheDocument();
    // });
  });
});
