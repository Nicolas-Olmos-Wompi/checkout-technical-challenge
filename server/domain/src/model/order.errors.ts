export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product "${productId}" was not found.`);
    this.name = "ProductNotFoundError";
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product "${productId}": requested ${requested}, available ${available}.`,
    );
    this.name = "InsufficientStockError";
  }
}
