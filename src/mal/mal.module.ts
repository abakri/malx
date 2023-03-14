import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MalService } from './mal.service';

@Module({
  imports: [MalModule, HttpModule],
  providers: [MalService],
  exports: [MalService],
})

export class MalModule {}
