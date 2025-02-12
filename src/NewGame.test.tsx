import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NewGame from "./quickstart/newgame/NewGame";
import * as api from "./api";

vi.mock("./api", () => ({
  registerAgent: vi.fn(),
  fetchAgentDetails: vi.fn(),
  fetchStartingLocation: vi.fn(),
  getToken: vi.fn(),
  clearToken: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("renders the main heading correctly", async () => {
    render(
      <MemoryRouter>
        <NewGame />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { name: /New Game/i });
    expect(screen.getByRole("heading", { name: /New Game/i })).toBeInTheDocument();
});

it("displays input fields when no agent is registered", () => {
    (api.getToken as jest.Mock).mockReturnValue(null);
    render(
      <MemoryRouter>
        <NewGame />
      </MemoryRouter>
    );
    const callSignInputs = screen.getAllByPlaceholderText("Enter Call Sign");
    expect(callSignInputs[0]).toBeInTheDocument();
    const factionLabels = screen.getAllByText("Faction");
    expect(factionLabels[0]).toBeInTheDocument();
});

it("registers an agent successfully", async () => {
    (api.registerAgent as jest.Mock).mockResolvedValue({ token: "mock-token" });
    (api.fetchAgentDetails as jest.Mock).mockResolvedValue({ symbol: "TEST_AGENT", credits: 1000, headquarters: "X1-DF55-A1" });
    (api.fetchStartingLocation as jest.Mock).mockResolvedValue({ symbol: "X1-DF55-A1", systemSymbol: "X1-DF55", type: "PLANET", x: -10, y: 10 });

    render(
      <MemoryRouter>
        <NewGame />
      </MemoryRouter>
    );

    fireEvent.change(screen.getAllByPlaceholderText("Enter Call Sign")[0], { target: { value: "TEST_AGENT" } });
    fireEvent.click(screen.getAllByText("Register")[0]);

    await waitFor(() => expect(api.fetchAgentDetails).toHaveBeenCalled());
    await waitFor(() => expect(screen.getAllByText("Symbol:")[0].parentElement).toHaveTextContent("TEST_AGENT"));
    await waitFor(() => expect(screen.getAllByText("Credits:")[0].parentElement).toHaveTextContent("1000"));
});

it("handles registration error", async () => {
    (api.registerAgent as jest.Mock).mockRejectedValue(new Error("Registration failed"));
    render(
      <MemoryRouter>
        <NewGame />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText("Register")[0]);

    await waitFor(() => expect(screen.getByText("Registration failed")).toBeInTheDocument());
});

it("handles expired session and clears token", async () => {
    (api.getToken as jest.Mock).mockReturnValue("mock-token");
    (api.fetchAgentDetails as jest.Mock).mockRejectedValue(new Error("Session expired"));

    render(
      <MemoryRouter>
        <NewGame />
      </MemoryRouter>
    );

    await waitFor(() => expect(api.clearToken).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Session expired. Please re-register.")).toBeInTheDocument());
});

it("clears agent data when reset button is clicked", async () => {
    vi.spyOn(api, "registerAgent").mockResolvedValue({ token: "mock-token" });
    vi.spyOn(api, "fetchAgentDetails").mockResolvedValue({
      symbol: "TEST_AGENT",
      credits: 1000,
      headquarters: "X1-DF55-A1",
    });
  
    render(
      <MemoryRouter>
        <NewGame />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getAllByPlaceholderText("Enter Call Sign")[0], { target: { value: "TEST_AGENT" } });
    fireEvent.click(screen.getAllByText("Register")[0]);
  
    await waitFor(() => expect(api.fetchAgentDetails).toHaveBeenCalled());
  
    // fireEvent.click(screen.getByRole("button", { name: /reset game/i }));
    fireEvent.click(screen.getAllByText("Reset Game")[0]);
  
    expect(api.clearToken).toHaveBeenCalled();
  });