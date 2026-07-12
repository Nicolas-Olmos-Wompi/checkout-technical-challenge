import { MigrationInterface, QueryRunner } from "typeorm";

type ProductImageUpdate = {
  id: string;
  name: string;
  image: string;
};

const PRODUCT_IMAGES: ProductImageUpdate[] = [
  {
    id: "21427bb0-7f8a-495b-8939-943052b74a0f",
    name: "Wireless Bluetooth Headphones",
    image: "https://www.pngall.com/wp-content/uploads/5/Bluetooth-Headset-PNG-Clipart-thumb.webp",
  },
  {
    id: "152ee26f-6249-4cb4-9216-65ba85bd508b",
    name: "Stainless Steel Water Bottle",
    image: "https://www.pngall.com/wp-content/uploads/13/Bottle-PNG-Images-thumb.webp",
  },
  {
    id: "eb9131ac-1faa-4a3c-b1f3-dee124acb1c7",
    name: "Mechanical Keyboard RGB",
    image: "https://www.pngall.com/wp-content/uploads/2016/04/Keyboard-Transparent-thumb.webp",
  },
  {
    id: "be90e72e-d926-41eb-ac5f-eba089f4f3d9",
    name: "Ergonomic Office Chair",
    image: "https://www.pngall.com/wp-content/uploads/11/Office-Chair-PNG-Images-HD-thumb.webp",
  },
  {
    id: "3a0249ea-43b9-4f2a-a0d6-fa8939fa1bd3",
    name: '4K Ultra HD Monitor 27"',
    image: "https://www.pngall.com/wp-content/uploads/2016/04/Monitor-PNG-thumb.webp",
  },
  {
    id: "4bc4a7c9-91e7-44a4-857c-8e4d3ca73233",
    name: "Portable Power Bank 20000mAh",
    image: "https://www.pngall.com/wp-content/uploads/19/Charger-Clutching-Handheld-Device-PNG-thumb.webp",
  },
  {
    id: "8af9413a-534e-4df2-ac8b-11b822b858fa",
    name: "Smart Fitness Watch",
    image: "https://www.pngall.com/wp-content/uploads/15/iWatch-Transparent-thumb.webp",
  },
  {
    id: "3bb2cf72-2249-458c-a7b2-d8f8150a4db8",
    name: "Espresso Coffee Machine",
    image: "https://www.pngall.com/wp-content/uploads/5/Espresso-Coffee-Machine-PNG-Free-Image-thumb.webp",
  },
  {
    id: "576c8894-5d7e-44d8-8873-f1caa15729a8",
    name: "Noise Cancelling Earbuds",
    image: "https://www.pngall.com/wp-content/uploads/22/Sonic-Headphones-Black-Curved-PNG-thumb.webp",
  },
  {
    id: "a0f22f58-4bac-4149-af10-3655b63e57a9",
    name: 'Backpack Laptop 15.6"',
    image: "https://www.pngall.com/wp-content/uploads/2/Backpack-Background-PNG-Image-thumb.webp",
  },
];

export class UpdateProductImages1762780800007 implements MigrationInterface {
  name = "UpdateProductImages1762780800007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const product of PRODUCT_IMAGES) {
      await queryRunner.query(
        `UPDATE "products" SET "image" = $1 WHERE "id" = $2`,
        [product.image, product.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to original placeholder URLs
    const originalImages: ProductImageUpdate[] = [
      {
        id: "11111111-1111-1111-1111-111111111101",
        name: "Wireless Bluetooth Headphones",
        image: "https://images.example.com/products/wireless-headphones.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111102",
        name: "Stainless Steel Water Bottle",
        image: "https://images.example.com/products/water-bottle.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111103",
        name: "Mechanical Keyboard RGB",
        image: "https://images.example.com/products/mechanical-keyboard.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111104",
        name: "Ergonomic Office Chair",
        image: "https://images.example.com/products/office-chair.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111105",
        name: '4K Ultra HD Monitor 27"',
        image: "https://images.example.com/products/4k-monitor.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111106",
        name: "Portable Power Bank 20000mAh",
        image: "https://images.example.com/products/power-bank.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111107",
        name: "Smart Fitness Watch",
        image: "https://images.example.com/products/fitness-watch.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111108",
        name: "Espresso Coffee Machine",
        image: "https://images.example.com/products/espresso-machine.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111109",
        name: "Noise Cancelling Earbuds",
        image: "https://images.example.com/products/earbuds.jpg",
      },
      {
        id: "11111111-1111-1111-1111-111111111110",
        name: 'Backpack Laptop 15.6"',
        image: "https://images.example.com/products/laptop-backpack.jpg",
      },
    ];

    for (const product of originalImages) {
      await queryRunner.query(
        `UPDATE "products" SET "image" = $1 WHERE "id" = $2`,
        [product.image, product.id],
      );
    }
  }
}
