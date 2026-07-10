class Product {
  public id: string;
  public name: string;
  public description: string;
  public price: number;
  public stock: number;
  public image: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    price: number,
    stock: number,
    image: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.image = image;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { Product };
