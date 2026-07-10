import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
  Repository,
} from "typeorm";
import { IProductRepository } from "domain/src/interface/product.repository";
import {
  PaginatedProducts,
  ProductFilterCriteria,
} from "domain/src/model/product.type";
import { ProductEntityMapper } from "../../../model/mapper/product-entity.mapper";
import { ProductEntity } from "./product.entity";

export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findProducts(
    criteria: ProductFilterCriteria,
  ): Promise<PaginatedProducts> {
    const [entities, total] = await this.repository.findAndCount({
      where: this.buildWhere(criteria),
      skip: (criteria.page - 1) * criteria.pageSize,
      take: criteria.pageSize,
      order: { createdAt: "DESC" },
    });

    return {
      items: ProductEntityMapper.toModelList(entities),
      total,
    };
  }

  private buildWhere(criteria: ProductFilterCriteria) {
    const where: Record<string, unknown> = {};

    if (criteria.name) {
      where.name = ILike(`%${criteria.name}%`);
    }

    if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined) {
      where.price = Between(criteria.minPrice, criteria.maxPrice);
    } else if (criteria.minPrice !== undefined) {
      where.price = MoreThanOrEqual(criteria.minPrice);
    } else if (criteria.maxPrice !== undefined) {
      where.price = LessThanOrEqual(criteria.maxPrice);
    }

    return where;
  }
}
