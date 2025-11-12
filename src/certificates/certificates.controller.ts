import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@ApiTags('Certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Post()
  @ApiOperation({ summary: 'Issue a certificate' })
  create(@Body() dto: CreateCertificateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List certificates by user' })
  list(@Query('userId') userId: string) {
    return this.service.listByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by id' })
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete certificate' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
