// src/upload/upload.controller.ts
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { relative } from 'path';
import { buildMulterOptions, FileType } from './upload.config';

@ApiTags('files')
@Controller('files')
export class UploadController {
  // IMAGE
  @Post('image')
  @UseInterceptors(FileInterceptor('file', buildMulterOptions('image')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image uploaded');
    return this.buildResponse(file, 'image');
  }

  // VIDEO
  @Post('video')
  @UseInterceptors(FileInterceptor('file', buildMulterOptions('video')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadVideo(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No video uploaded');
    return this.buildResponse(file, 'video');
  }

  // AUDIO
  @Post('audio')
  @UseInterceptors(FileInterceptor('file', buildMulterOptions('audio')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadAudio(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No audio uploaded');
    return this.buildResponse(file, 'audio');
  }

  // DOCUMENT (PDF)
  @Post('document')
  @UseInterceptors(FileInterceptor('file', buildMulterOptions('document')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadDocument(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No document uploaded');
    return this.buildResponse(file, 'document');
  }

  private buildResponse(file: Express.Multer.File, type: FileType | string) {
    // file.path: e.g. "uploads/2025/01/pdf/filename.pdf"
    const relPath = relative('uploads', file.path).replace(/\\/g, '/');
    // Public URL, assuming you serve /uploads statically from ./uploads
    const url = `/uploads/${relPath}`;

    return {
      success: true,
      type,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: relPath, // relative path, if you want to store in DB
      url,
      fullPath: process.env.FILE_PUBLIC_URL + '/uploads/' + relPath,
    };
  }
}
