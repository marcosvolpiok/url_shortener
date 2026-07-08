import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UrlProviders } from './url.providers';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UrlController],
  providers: [...UrlProviders, UrlService],
  exports: [UrlService],
})
export class UrlModule {}
