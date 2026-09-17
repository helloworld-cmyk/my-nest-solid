import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service.js';
import { CategoryListItemDto } from './dto/response/category.js';
import { JwtAuthGuard } from '../auth/guard/jwt.guard.js';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active categories' })
  @ApiResponse({
    status: 200,
    description: 'List of active categories',
    type: CategoryListItemDto,
    isArray: true,
  })
  getCategories() {
    return this.categoryService.getCategories();
  }

  // TODO: temporarily disabled - admin-only create category endpoint
  // @Post()
  // @UseGuards(JwtAdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a category (admin only)' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Category created successfully',
  //   type: CategoryResponseDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Unauthorized - missing or invalid token',
  // })
  // @ApiResponse({
  //   status: HttpStatus.FORBIDDEN,
  //   description: 'Forbidden - admin access required',
  // })
  // @ApiResponse({
  //   status: HttpStatus.CONFLICT,
  //   description: 'Conflict - a category with this slug already exists',
  // })
  // createCategory(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categoryService.createCategory(createCategoryDto);
  // }
}
