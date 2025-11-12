import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// Swagger (optional but recommended)
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function fileName(
  req: any,
  file: Express.Multer.File,
  cb: (e: any, name: string) => void,
) {
  const base = file.originalname.replace(/\.[^/.]+$/, '');
  const safe = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const stamp = Date.now();
  cb(null, `${safe}-${stamp}${extname(file.originalname)}`);
}

@Controller('files')
@ApiTags('files')
export class UploadController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads', // ensure the folder exists
        filename: fileName,
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Only JPG, PNG, WEBP allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // The static server maps /uploads -> ./uploads
    const url = `/uploads/${file.filename}`;
    return {
      success: true,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url,
    };
  }
}
