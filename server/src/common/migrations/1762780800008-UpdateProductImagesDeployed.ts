import { MigrationInterface, QueryRunner } from "typeorm";

type ProductImageUpdate = {
  name: string;
  image: string;
};

const PRODUCT_IMAGES: ProductImageUpdate[] = [
  {
    name: "Wireless Bluetooth Headphones",
    image:
      "https://www.pngall.com/wp-content/uploads/5/Bluetooth-Headset-PNG-Clipart-thumb.webp",
  },
  {
    name: "Stainless Steel Water Bottle",
    image:
      "https://www.pngall.com/wp-content/uploads/13/Bottle-PNG-Images-thumb.webp",
  },
  {
    name: "Mechanical Keyboard RGB",
    image:
      "https://www.pngall.com/wp-content/uploads/2016/04/Keyboard-Transparent-thumb.webp",
  },
  {
    name: "Ergonomic Office Chair",
    image:
      "https://www.pngall.com/wp-content/uploads/11/Office-Chair-PNG-Images-HD-thumb.webp",
  },
  {
    name: '4K Ultra HD Monitor 27"',
    image:
      "https://www.pngall.com/wp-content/uploads/2016/04/Monitor-PNG-thumb.webp",
  },
  {
    name: "Portable Power Bank 20000mAh",
    image:
      "https://www.pngall.com/wp-content/uploads/19/Charger-Clutching-Handheld-Device-PNG-thumb.webp",
  },
  {
    name: "Smart Fitness Watch",
    image:
      "https://www.pngall.com/wp-content/uploads/15/iWatch-Transparent-thumb.webp",
  },
  {
    name: "Espresso Coffee Machine",
    image:
      "https://www.pngall.com/wp-content/uploads/5/Espresso-Coffee-Machine-PNG-Free-Image-thumb.webp",
  },
  {
    name: "Noise Cancelling Earbuds",
    image:
      "https://www.pngall.com/wp-content/uploads/22/Sonic-Headphones-Black-Curved-PNG-thumb.webp",
  },
  {
    name: 'Backpack Laptop 15.6"',
    image:
      "https://www.pngall.com/wp-content/uploads/2/Backpack-Background-PNG-Image-thumb.webp",
  },
];

export class UpdateProductImagesDeployed1762780800008
  implements MigrationInterface
{
  name = "UpdateProductImagesDeployed1762780800008";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const product of PRODUCT_IMAGES) {
      await queryRunner.query(
        `UPDATE "products" SET "image" = $1 WHERE "name" = $2`,
        [product.image, product.name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const product of PRODUCT_IMAGES) {
      await queryRunner.query(
        `UPDATE "products" SET "image" = $1 WHERE "name" = $2`,
        [
          `https://images.example.com/products/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
          product.name,
        ],
      );
    }
  }
}
