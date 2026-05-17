import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { BranchesService } from '../application/branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchQueryDto } from './dto/branch-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Chi nhánh (Branches)')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách chi nhánh' })
  @ApiResponse({ status: 200, description: 'Danh sách chi nhánh với phân trang' })
  async findAll(@Query() query: BranchQueryDto) {
    const data = await this.branchesService.findAll(query);
    return { message: 'Lấy danh sách chi nhánh thành công', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết chi nhánh' })
  @ApiParam({ name: 'id', description: 'UUID của chi nhánh' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string) {
    const data = await this.branchesService.findOne(id);
    return { message: 'Lấy thông tin chi nhánh thành công', data };
  }

  @Post()
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo chi nhánh mới (Admin)' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateBranchDto) {
    const data = await this.branchesService.create(dto);
    return { message: 'Tạo chi nhánh thành công', data };
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật chi nhánh (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của chi nhánh' })
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    const data = await this.branchesService.update(id, dto);
    return { message: 'Cập nhật chi nhánh thành công', data };
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa chi nhánh (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của chi nhánh' })
  async remove(@Param('id') id: string) {
    const data = await this.branchesService.remove(id);
    return { message: 'Xóa chi nhánh thành công', data };
  }
}
