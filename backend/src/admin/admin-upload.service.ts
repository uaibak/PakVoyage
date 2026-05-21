import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Injectable()
export class AdminUploadService {
  async saveUploadedImages(files: UploadedImage[]): Promise<string[]> {
    if (files.length === 0) {
      throw new BadRequestException('At least one image file is required.');
    }

    const uploadsPath = join(process.cwd(), 'uploads');
    await mkdir(uploadsPath, { recursive: true });

    return Promise.all(
      files.map(async (file) => {
        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException('Only image files can be uploaded.');
        }

        const extension = extname(file.originalname).toLowerCase() || '.jpg';
        const filename = `${Date.now()}-${randomUUID()}${extension}`;
        await writeFile(join(uploadsPath, filename), file.buffer);

        return `/uploads/${filename}`;
      }),
    );
  }
}
