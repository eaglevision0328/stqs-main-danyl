import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PurchaseShip from "../quickstart/purchaseship/PurchaseShip";
import * as api from "../api";
import * as utils from "../utils";

// Mock API module properly using `vi.mock`
vi.mock("../api", () => ({
  findShipyards: vi.fn(),
  getAvailableShips: vi.fn(),
  purchaseShip: vi.fn()
}));

// Mock `getAgentDetailsWithSystem`
vi.mock("../utils", () => ({
  getAgentDetailsWithSystem: vi.fn()
}));

let utilsRender: ReturnType<typeof render>;

beforeEach(() => {
  vi.clearAllMocks();

  (utils.getAgentDetailsWithSystem as jest.Mock).mockResolvedValue({
    agentData: { headquarters: "X1-DF55-A1" },
    systemSymbol: "X1-DF55"
  });

  (api.findShipyards as jest.Mock).mockResolvedValue([
    { symbol: "X1-DF55-A1", systemSymbol: "X1-DF55" },
    { symbol: "X1-DF55-A2", systemSymbol: "X1-DF55" }
  ]);

  utilsRender = render(
    <MemoryRouter>
      <PurchaseShip />
    </MemoryRouter>
  );
});

afterEach(() => {
  utilsRender.unmount();
  vi.restoreAllMocks();
});

it("renders the Purchase Ship component", async () => {
  await waitFor(() => expect(screen.getByRole("heading", { name: /Purchase Ship/i })).toBeInTheDocument());
});

it("displays available shipyards", async () => {
  await waitFor(() => expect(screen.getByText("X1-DF55-A1")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("X1-DF55-A2")).toBeInTheDocument());
});

it("loads ships when a shipyard is selected", async () => {
  (api.getAvailableShips as jest.Mock).mockResolvedValue({
    ships: [{ name: "Explorer", type: "SHIP_MINING_DRONE" }, { name: "Freighter", type: "SHIP_MINING_MOON" }]
  });

  await screen.findByText("X1-DF55-A1");

  // Select the first "View Ships" button using `getAllByRole`
  const viewShipsButtons = await screen.getAllByRole("button", { name: "View Ships" });
  fireEvent.click(viewShipsButtons[0]);

  await waitFor(() => expect(screen.getByText("Explorer")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("Freighter")).toBeInTheDocument());
});

it("displays an error when loading ships fails", async () => {
  (api.getAvailableShips as jest.Mock).mockRejectedValue(new Error("Failed to load ships"));

  await screen.findByText("X1-DF55-A1");

  // Select the first "View Ships" button
  const viewShipsButtons = await screen.getAllByRole("button", { name: "View Ships" });
  fireEvent.click(viewShipsButtons[0]);

  expect(await screen.findByText("Failed to load ships")).toBeInTheDocument();
});

it("purchases a ship successfully", async () => {
  (api.getAvailableShips as jest.Mock).mockResolvedValue({ ships: [{ name: "Explorer", type: "SHIP_MINING_DRONE" }] });
  (api.purchaseShip as jest.Mock).mockResolvedValue({});

  await screen.findByText("X1-DF55-A1");

  const viewShipsButtons = await screen.getAllByRole("button", { name: "View Ships" });
  fireEvent.click(viewShipsButtons[0]);

  fireEvent.click(await screen.findByText("Buy"));

  await waitFor(() => expect(api.purchaseShip).toHaveBeenCalledWith("SHIP_MINING_DRONE", "X1-DF55-A1"));
});

it("displays an error if ship purchase fails", async () => {
  (api.getAvailableShips as jest.Mock).mockResolvedValue({ ships: [{ name: "Explorer", type: "SHIP_MINING_DRONE" }] });
  (api.purchaseShip as jest.Mock).mockRejectedValue(new Error("Purchase failed"));

  await screen.findByText("X1-DF55-A1");

  const viewShipsButtons = await screen.getAllByRole("button", { name: "View Ships" });
  fireEvent.click(viewShipsButtons[0]);

  fireEvent.click(await screen.findByText("Buy"));

  expect(await screen.findByText("Purchase failed")).toBeInTheDocument();
});