import { Module } from '@nestjs/common';
import { RoomsService } from './application/rooms.service';
import { RoomsController } from './interface/rooms.controller';
import { RoomsRepository } from './infrastructure/rooms.repository';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [ImageModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService],
})
export class RoomsModule {}
