import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a company' })
  create(@Body() dto: any) {
    return this.companiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  findAll(@Query() query: any) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
