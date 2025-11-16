// src/upload/upload.config.ts
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export type FileType = 'image' | 'video' | 'audio' | 'document';

export const FILE_UPLOAD_CONFIG: Record<
  FileType,
  { mimes: string[]; maxSize: number }
> = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 15 * 1024 * 1024, // 15 MB
  },
  video: {
    mimes: ['video/mp4', 'video/x-matroska', 'video/quicktime'],
    maxSize: 200 * 1024 * 1024, // 200 MB
  },
  audio: {
    mimes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 20 * 1024 * 1024, // 20 MB
  },
  document: {
    mimes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
};

function fileName(
  req: any,
  file: Express.Multer.File,
  cb: (error: any, filename: string) => void,
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

function getTypeFolder(type: FileType): string {
  switch (type) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    case 'document':
      return 'pdf'; // as you requested
    default:
      return 'other';
  }
}

/**
 * Build multer options based on file type (image, video, audio, document).
 * Files will be saved like: uploads/2025/01/pdf/filename.pdf
 */
export function buildMulterOptions(type: FileType): MulterOptions {
  const config = FILE_UPLOAD_CONFIG[type];

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const now = new Date();
        const year = now.getFullYear().toString(); // e.g. "2025"
        const month = String(now.getMonth() + 1).padStart(2, '0'); // "01".."12"
        const typeFolder = getTypeFolder(type); // "pdf", "image", etc.

        const uploadRoot = 'uploads';
        const fullPath = join(uploadRoot, year, month, typeFolder);

        // Ensure directories exist
        fs.mkdirSync(fullPath, { recursive: true });

        cb(null, fullPath);
      },
      filename: fileName,
    }),
    limits: {
      fileSize: config.maxSize,
    },
    fileFilter: (req, file, cb) => {
      if (!config.mimes.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            `Invalid file type for ${type}. Allowed: ${config.mimes.join(
              ', ',
            )}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}
