import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MineAsteroids from "../quickstart/mineAsteroids/MineAsteroids";
import * as api from "../Helper/api";
import { ShipProvider } from "../context/ShipContext";
import { AsteroidProvider } from "../context/AsteroidContext"

vi.mock("../Helper/api", () => ({
  findEngineeredAsteroid: vi.fn(),
  setShipToOrbit: vi.fn(),
  navigateToAsteroid: vi.fn(),
  dockShip: vi.fn(),
  refuelShip: vi.fn(),
  extractOres: vi.fn(),
}));
let utilsRender: ReturnType<typeof render>;

const mockShipData = {
  agent: { name: "Test Agent" },
  ship: { symbol: "TEST_SHIP", nav: { systemSymbol: "X1-DF55" } },
  transaction: { id: "TRANS123" },
};

const renderComponent = (shipData = mockShipData) => {
  return render(
    <MemoryRouter>
      <AsteroidProvider>
        <ShipProvider shipData={shipData}>
          <MineAsteroids />
        </ShipProvider>
      </AsteroidProvider>
    </MemoryRouter>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  utilsRender = renderComponent(mockShipData)
});

afterEach(() => {
  utilsRender.unmount();
  vi.restoreAllMocks();
});

it("renders the Mine Asteroids page correctly", async () => {
  //renderComponent();
  await waitFor(() => screen.findByRole("heading", { name: /Mine Asteroids/i }));
  expect(await screen.findByText("Find Engineered Asteroid")).toBeInTheDocument();
});

it("finds an engineered asteroid", async () => {
  vi.spyOn(api, "findEngineeredAsteroid").mockResolvedValue([{ symbol: "ASTEROID_1" }]);

  const findAsteroidButton = screen.getAllByText("Find Engineered Asteroid")[0];
  fireEvent.click(findAsteroidButton);

  await waitFor(() => expect(api.findEngineeredAsteroid).toHaveBeenCalledWith("X1-DF55"));
});

it("handles error when finding asteroid fails", async () => {
  vi.spyOn(api, "findEngineeredAsteroid").mockRejectedValue(new Error("Asteroid not found"));

  fireEvent.click(await screen.findByText("Find Engineered Asteroid"));

  await waitFor(() => expect(screen.findByText("Asteroid not found")).toBeTruthy());
});

it("navigates to asteroid successfully", async () => {
  vi.spyOn(api, "findEngineeredAsteroid").mockResolvedValue([{ symbol: "ASTEROID_1" }]);
  vi.spyOn(api, "setShipToOrbit").mockResolvedValue({});
  vi.spyOn(api, "navigateToAsteroid").mockResolvedValue({});

  fireEvent.click(await screen.findByText("Find Engineered Asteroid"));

  // Use a function matcher to find partial text
  await waitFor(() =>
    expect(
      screen.getByText((content) => content.includes("Asteroid found: ASTEROID_1"))
    ).toBeInTheDocument()
  );

  const navigateButton = await screen.findByText("Navigate to Asteroid");
  expect(navigateButton).not.toBeDisabled();

  fireEvent.click(navigateButton);

  await waitFor(() => expect(api.setShipToOrbit).toHaveBeenCalledWith("TEST_SHIP"));
  await waitFor(() => expect(api.navigateToAsteroid).toHaveBeenCalledWith("TEST_SHIP", "ASTEROID_1"));

  // Use partial text matching again for transit status
  await waitFor(() =>
    expect(
      screen.getByText((content) => content.includes("In transit to asteroid"))
    ).toBeInTheDocument()
  );
});

it("docks and refuels successfully", async () => {
  vi.spyOn(api, "findEngineeredAsteroid").mockResolvedValue([{ symbol: "ASTEROID_1" }]);
  vi.spyOn(api, "dockShip").mockResolvedValue({});
  vi.spyOn(api, "refuelShip").mockResolvedValue({});
  renderComponent(mockShipData);

  // Click the first "Find Engineered Asteroid" button
  const findAsteroidButton = screen.getAllByText("Find Engineered Asteroid")[0];
  fireEvent.click(findAsteroidButton);

  await waitFor(() =>
    expect(
      screen.getByText((content) => content.includes("Asteroid found: ASTEROID_1"))
    ).toBeInTheDocument()
  );

  // Click the first enabled "Dock & Refuel" button
  const dockButtons = screen.getAllByText("Dock & Refuel");
  const dockButton = dockButtons.find((btn) => !btn.hasAttribute("disabled"));

  if (!dockButton) {
    throw new Error("No enabled 'Dock & Refuel' button found.");
  }

  fireEvent.click(dockButton);

  await waitFor(() => expect(api.dockShip).toHaveBeenCalledWith("TEST_SHIP"));
  await waitFor(() => expect(api.refuelShip).toHaveBeenCalledWith("TEST_SHIP"));

  await waitFor(() =>
    expect(
      screen.getByText((content) => content.includes("Ship refueled. Ready to mine!"))
    ).toBeInTheDocument()
  );
});

it("extracts ores successfully", async () => {
  vi.spyOn(api, "findEngineeredAsteroid").mockResolvedValue([{ symbol: "ASTEROID_1" }]);
  vi.spyOn(api, "extractOres").mockResolvedValue({ extraction: "ORE_1" });
  renderComponent(mockShipData);

  // Find and click the first enabled "Find Engineered Asteroid" button
  const findButtons = screen.getAllByText("Find Engineered Asteroid");
  const findButton = findButtons.find((btn) => !btn.hasAttribute("disabled"));

  if (!findButton) {
    throw new Error("No enabled 'Find Engineered Asteroid' button found.");
  }

  fireEvent.click(findButton);

  // Wait for asteroid to be found
  await waitFor(() =>
    expect(
      screen.getByText((content) => content.includes("Asteroid found: ASTEROID_1"))
    ).toBeInTheDocument()
  );

  // Find and click the first enabled "Extract Ores" button
  const extractButtons = screen.getAllByText("Extract Ores");
  const extractButton = extractButtons.find((btn) => !btn.hasAttribute("disabled"));

  if (!extractButton) {
    throw new Error("No enabled 'Extract Ores' button found.");
  }

  fireEvent.click(extractButton);

  await waitFor(() => expect(api.extractOres).toHaveBeenCalledWith("TEST_SHIP"));

  await waitFor(() =>
    expect(
      screen.getByText((content) => content.includes("Extracted: ORE_1"))
    ).toBeInTheDocument()
  );
});