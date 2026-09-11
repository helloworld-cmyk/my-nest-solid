import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListProductsQueryDto } from './dto/request/list-products.query.js';
import { SearchProductsQueryDto } from './dto/request/search-products.query.js';
import { FilterOptionsResponseDto } from './dto/response/filter-options.js';
import { HomeProductsResponseDto } from './dto/response/home-products.js';
import {
  ProductDetailDto,
  RelatedProductDto,
} from './dto/response/product-detail.js';
import { ProductListResponseDto } from './dto/response/product-item.js';
import { SearchProductsResponseDto } from './dto/response/search-response.js';
import { ProductService } from './product.service.js';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters, sort and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of active products',
    type: ProductListResponseDto,
  })
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.productService.listProducts(query);
  }

  @Get('home')
  @ApiOperation({
    summary: 'Get home products (hot deals, new arrivals, on sale)',
  })
  @ApiResponse({
    status: 200,
    description: 'Home products data',
    type: HomeProductsResponseDto,
  })
  getHomeProducts() {
    return this.productService.getHomeProducts();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by keyword' })
  @ApiResponse({
    status: 200,
    description: 'Search results with filter categories',
    type: SearchProductsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - query "keyword" is required',
  })
  searchProducts(@Query() query: SearchProductsQueryDto) {
    return this.productService.searchProducts(query);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available filter options for products' })
  @ApiResponse({
    status: 200,
    description: 'Filter options (categories, colors, sizes, price bounds)',
    type: FilterOptionsResponseDto,
  })
  getFilters() {
    return this.productService.getFilterOptions();
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Get related products by product slug' })
  @ApiResponse({
    status: 200,
    description: 'List of related active products',
    type: RelatedProductDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  getRelated(@Param('slug') slug: string) {
    return this.productService.getRelatedProducts(slug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  @ApiResponse({
    status: 200,
    description:
      'Product detail with images, variants, reviews and related products',
    type: ProductDetailDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  getDetail(@Param('slug') slug: string) {
    return this.productService.getProductDetail(slug);
  }
}
