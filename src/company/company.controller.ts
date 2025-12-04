import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { AssignCourseDto } from './dto/assign-course.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './schemas/company.schema';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiCreatedResponse({
    type: Company,
    description: 'Company created successfully',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() dto: CreateCompanyDto): Promise<Company> {
    return this.companyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiOkResponse({ type: [Company], description: 'List of companies' })
  findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Post(':id/courses')
  @ApiOperation({ summary: 'Assign a course to a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: AssignCourseDto })
  @ApiResponse({ status: 200, type: Company })
  assignCourse(
    @Param('id') id: string,
    @Body() dto: AssignCourseDto,
  ): Promise<Company> {
    return this.companyService.assignCourse(id, dto.courseId);
  }

  @Delete(':id/courses/:courseId')
  @ApiOperation({ summary: 'Unassign a course from a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, type: Company })
  unassignCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ): Promise<Company> {
    return this.companyService.unassignCourse(id, courseId);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get all courses assigned to a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  getCompanyCourses(@Param('id') id: string): Promise<any[]> {
    return this.companyService.getCompanyCourses(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiOkResponse({ type: Company, description: 'Company found' })
  @ApiNotFoundResponse({ description: 'Company not found' })
  findOne(@Param('id') id: string): Promise<Company> {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiOkResponse({ type: Company, description: 'Company updated successfully' })
  @ApiNotFoundResponse({ description: 'Company not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company by ID' })
  @ApiOkResponse({ description: 'Company deleted successfully' })
  @ApiNotFoundResponse({ description: 'Company not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.companyService.remove(id);
    return { message: 'Company deleted successfully' };
  }
}
