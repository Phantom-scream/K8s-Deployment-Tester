import { render, screen } from "@testing-library/react";
import App from "./App";


jest.mock("socket.io-client", () => {
  const mockSocket = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
  return jest.fn(() => mockSocket);
});

test("renders app heading and buttons", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /k8s deployment tester/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /start test/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /cleanup resources/i })).toBeInTheDocument();
});
