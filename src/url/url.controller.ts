import { Controller, Get, Post, Body } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto, UrlDto } from './url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Get('/urls')
  findAllUrls(): Promise<UrlDto[]> {
    return this.urlService.findAllUrls();
  }

  @Post('/urls')
  createUrl(@Body() createUrlDto: CreateUrlDto): Promise<CreateUrlDto> {
    return this.urlService.createUrl(createUrlDto);
  }
}
