import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

class GetProductsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;
}

type ProductResponse = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type PaginatedProductsResponse = {
  items: ProductResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export { GetProductsRequest };
export type { ProductResponse, PaginatedProductsResponse };
