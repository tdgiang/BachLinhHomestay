import { Module } from '@nestjs/common';
import { ImageService } from './application/image.service';

@Module({
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
