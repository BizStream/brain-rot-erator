import "@testing-library/jest-dom";
import { handleFileChange } from "../src/app/page";

jest.mock("../src/app/page", () => ({
  handleFileChange: jest.fn(),
}));

describe("Attach mp4 button", () => {
  it("should return the file name", () => {
    const mockFile = new File([""], "test.mp4", { type: "video/mp4" });

    handleFileChange.mockReturnValue("test.mp4");

    handleFileChange(mockFile);
    expect(handleFileChange).toHaveBeenCalledWith(mockFile);
    expect(handleFileChange(mockFile)).toBe("test.mp4");
  });

  it("should return an empty string", () => {
    const mockFile = new File([""], "", { type: "video/mp4" });

    handleFileChange.mockReturnValue("");

    handleFileChange(mockFile);
    expect(handleFileChange).toHaveBeenCalledWith(mockFile);
    expect(handleFileChange(mockFile)).toBe("");
  });
});
