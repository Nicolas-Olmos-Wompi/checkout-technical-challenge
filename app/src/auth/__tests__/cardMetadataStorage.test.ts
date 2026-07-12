import * as SecureStore from "expo-secure-store";
import {
  saveCardMetadata,
  loadCardMetadata,
  clearCardMetadata,
  type CardMetadata,
} from "../cardMetadataStorage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const CARD_METADATA_KEY = "card_metadata";

describe("cardMetadataStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const metadata: CardMetadata = {
    brand: "VISA",
    lastFour: "4242",
    expMonth: "12",
    expYear: "29",
    cardHolder: "John Doe",
  };

  it("persists card metadata as JSON under the expected key", async () => {
    await saveCardMetadata(metadata);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      CARD_METADATA_KEY,
      JSON.stringify(metadata),
    );
  });

  it("never persists raw card number or CVC fields", async () => {
    await saveCardMetadata(metadata);

    const [, storedValue] = (SecureStore.setItemAsync as jest.Mock).mock.calls[0];
    expect(storedValue).not.toContain("cardNumber");
    expect(storedValue).not.toContain("cvc");
  });

  it("reads and parses stored metadata", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
      JSON.stringify(metadata),
    );

    const result = await loadCardMetadata();

    expect(result).toEqual(metadata);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(CARD_METADATA_KEY);
  });

  it("returns null when no metadata is stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    expect(await loadCardMetadata()).toBeNull();
  });

  it("returns null when stored metadata is invalid JSON", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("not-json");

    expect(await loadCardMetadata()).toBeNull();
  });

  it("deletes stored metadata on clear", async () => {
    await clearCardMetadata();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(CARD_METADATA_KEY);
  });
});
