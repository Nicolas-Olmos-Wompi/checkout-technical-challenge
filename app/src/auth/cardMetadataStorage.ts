import * as SecureStore from "expo-secure-store";
import type { CardBrand } from "../utils/cardValidation";

const CARD_METADATA_KEY = "card_metadata";

/**
 * Non-sensitive card metadata safe to persist for display purposes
 * (e.g. re-showing masked card info after navigating away and back).
 * The full PAN and CVC are intentionally excluded from this type and
 * must never be passed to `saveCardMetadata`.
 */
export type CardMetadata = {
  brand: CardBrand;
  lastFour: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
};

export async function saveCardMetadata(metadata: CardMetadata): Promise<void> {
  await SecureStore.setItemAsync(CARD_METADATA_KEY, JSON.stringify(metadata));
}

export async function loadCardMetadata(): Promise<CardMetadata | null> {
  const raw = await SecureStore.getItemAsync(CARD_METADATA_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CardMetadata;
  } catch {
    return null;
  }
}

export async function clearCardMetadata(): Promise<void> {
  await SecureStore.deleteItemAsync(CARD_METADATA_KEY);
}
