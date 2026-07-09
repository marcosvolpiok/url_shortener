import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto, UrlDto } from './url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/urls')
  createUrl(@Body() createUrlDto: CreateUrlDto): Promise<UrlDto> {
    return this.urlService.createUrl(createUrlDto);
  }

  @Get('/urls/:shortUrl')
  findOriginalUrl(@Param('shortUrl') shortUrl: string): Promise<string> {
    return this.urlService.findOriginalUrl(shortUrl);
  }
}
