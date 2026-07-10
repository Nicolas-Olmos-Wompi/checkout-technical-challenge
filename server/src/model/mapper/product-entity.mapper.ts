import { Product } from "../../../domain/src/model/product.entity";
import { ProductEntity } from "../../adapter/out/postgres/product.entity";

class ProductEntityMapper {
  public static toModel(productEntity: ProductEntity): Product {
    return new Product(
      productEntity.id,
      productEntity.name,
      productEntity.description,
      productEntity.price,
      productEntity.stock,
      productEntity.image,
      productEntity.createdAt,
      productEntity.updatedAt,
    );
  }

  public static toModelList(productEntities: ProductEntity[]): Product[] {
    return productEntities.map((productEntity) =>
      ProductEntityMapper.toModel(productEntity),
    );
  }
}

export { ProductEntityMapper };
