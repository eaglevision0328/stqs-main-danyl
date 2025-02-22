import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FirstMission from "../quickstart/firstmission/FirstMission";
import * as api from "../Helper/api";

vi.mock("../Helper/api", () => ({
  fetchContracts: vi.fn(),
  acceptContract: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("renders First Mission heading correctly", async () => {
  render(
    <MemoryRouter>
      <FirstMission />
    </MemoryRouter>
  );
  await screen.findByRole("heading", { name: /First Mission/i });
  expect(screen.getByRole("heading", { name: /First Mission/i })).toBeInTheDocument();
});

it("displays contracts when fetched successfully", async () => {
  (api.fetchContracts as jest.Mock).mockResolvedValue([
    {
      id: "contract-123",
      factionSymbol: "COSMIC",
      terms: {
        description: "Deliver 10 ores",
        deadline: new Date().toISOString(),
        deliver: [{ unitsRequired: 10, tradeSymbol: "ORE", destinationSymbol: "X1-BASE" }],
      },
      accepted: false,
    },
  ]);

  render(
    <MemoryRouter>
      <FirstMission />
    </MemoryRouter>
  );

  expect(await screen.findAllByText("Available Contracts")).toHaveLength(2);
  expect(screen.getByText("contract-123")).toBeInTheDocument();
  expect(screen.getByText("COSMIC")).toBeInTheDocument();
  expect(screen.getByText("Pending")).toBeInTheDocument();
});

it("handles contract acceptance successfully", async () => {
  (api.fetchContracts as jest.Mock).mockResolvedValue([
    {
      id: "contract-123",
      factionSymbol: "COSMIC",
      terms: {
        description: "Deliver 10 ores",
        deadline: new Date().toISOString(),
        deliver: [{ unitsRequired: 10, tradeSymbol: "ORE", destinationSymbol: "X1-BASE" }],
      },
      accepted: false,
    },
  ]);

  (api.acceptContract as jest.Mock).mockResolvedValue({});

  render(
    <MemoryRouter>
      <FirstMission />
    </MemoryRouter>
  );

  await waitFor(() => {
    const contractHeadings = screen.getAllByText("Available Contracts");
    expect(contractHeadings.length).toBeGreaterThan(0); // Ensure at least one is found
  });
  fireEvent.click(screen.getAllByText("Accept Contract")[0]);

  expect(api.acceptContract).toHaveBeenCalledWith("contract-123");
  expect(await screen.findByText("Accepted")).toBeInTheDocument();
});

it("handles API error when fetching contracts", async () => {
  (api.fetchContracts as jest.Mock).mockRejectedValue(new Error("Failed to fetch contracts"));

  render(
    <MemoryRouter>
      <FirstMission />
    </MemoryRouter>
  );

  //await waitFor(() => expect(screen.getByText("Failed to fetch contracts")).toBeInTheDocument());
  expect(await screen.findByText("Failed to fetch contracts")).toBeInTheDocument();
});

it("handles API error when accepting a contract", async () => {
  (api.fetchContracts as jest.Mock).mockResolvedValue([
    {
      id: "contract-123",
      factionSymbol: "COSMIC",
      terms: {
        description: "Deliver 10 ores",
        deadline: new Date().toISOString(),
        deliver: [{ unitsRequired: 10, tradeSymbol: "ORE", destinationSymbol: "X1-BASE" }],
      },
      accepted: false,
    },
  ]);

  (api.acceptContract as jest.Mock).mockRejectedValue(new Error("Failed to accept contract"));

  render(
    <MemoryRouter>
      <FirstMission />
    </MemoryRouter>
  );

  await waitFor(() => {
    const contractHeadings = screen.getAllByText("Available Contracts");
    expect(contractHeadings.length).toBeGreaterThan(0);
  });
  fireEvent.click(screen.getAllByText("Accept Contract")[0]);

  expect(await screen.findByText("Failed to fetch contracts")).toBeInTheDocument();
});
