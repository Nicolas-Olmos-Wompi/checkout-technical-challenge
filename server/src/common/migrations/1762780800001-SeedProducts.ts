import { MigrationInterface, QueryRunner } from "typeorm";

type SeedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
};

const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Wireless Bluetooth Headphones",
    description:
      "Over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 24999900,
    stock: 120,
    image: "https://images.example.com/products/wireless-headphones.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated 750ml water bottle that keeps beverages cold for 24 hours or hot for 12 hours.",
    price: 8999900,
    stock: 300,
    image: "https://images.example.com/products/water-bottle.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    name: "Mechanical Keyboard RGB",
    description:
      "Compact 75% mechanical keyboard with hot-swappable switches and RGB backlighting.",
    price: 34999900,
    stock: 75,
    image: "https://images.example.com/products/mechanical-keyboard.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    name: "Ergonomic Office Chair",
    description:
      "Adjustable mesh office chair with lumbar support and breathable backrest.",
    price: 89999900,
    stock: 40,
    image: "https://images.example.com/products/office-chair.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    name: '4K Ultra HD Monitor 27"',
    description:
      "27-inch IPS monitor with 4K resolution, HDR support and 99% sRGB color accuracy.",
    price: 129999900,
    stock: 55,
    image: "https://images.example.com/products/4k-monitor.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    name: "Portable Power Bank 20000mAh",
    description:
      "High-capacity power bank with fast charging support for phones, tablets and laptops.",
    price: 15999900,
    stock: 200,
    image: "https://images.example.com/products/power-bank.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    name: "Smart Fitness Watch",
    description:
      "Water-resistant fitness tracker with heart rate monitor, GPS and 7-day battery life.",
    price: 45999900,
    stock: 90,
    image: "https://images.example.com/products/fitness-watch.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    name: "Espresso Coffee Machine",
    description:
      "Compact espresso machine with 15-bar pressure pump and built-in milk frother.",
    price: 59999900,
    stock: 35,
    image: "https://images.example.com/products/espresso-machine.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111109",
    name: "Noise Cancelling Earbuds",
    description:
      "True wireless earbuds with active noise cancellation and IPX4 water resistance.",
    price: 19999900,
    stock: 150,
    image: "https://images.example.com/products/earbuds.jpg",
  },
  {
    id: "11111111-1111-1111-1111-111111111110",
    name: 'Backpack Laptop 15.6"',
    description:
      "Water-resistant laptop backpack with USB charging port and anti-theft compartment.",
    price: 12999900,
    stock: 180,
    image: "https://images.example.com/products/laptop-backpack.jpg",
  },
];

export class SeedProducts1762780800001 implements MigrationInterface {
  name = "SeedProducts1762780800001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const product of SEED_PRODUCTS) {
      await queryRunner.query(
        `INSERT INTO "products" ("id", "name", "description", "price", "stock", "image")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.id,
          product.name,
          product.description,
          product.price,
          product.stock,
          product.image,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ids = SEED_PRODUCTS.map((product) => product.id);
    await queryRunner.query('DELETE FROM "products" WHERE "id" = ANY($1)', [
      ids,
    ]);
  }
}

export { SEED_PRODUCTS };
