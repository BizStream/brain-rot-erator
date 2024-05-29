require("jest-fetch-mock").enableMocks();

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // Default mock response
  })
);
