import { Controller, Get, Post, Body, Param, Redirect } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto, OriginalUrlDto, UrlDto } from './url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/urls')
  createUrl(@Body() createUrlDto: CreateUrlDto): Promise<UrlDto> {
    return this.urlService.createUrl(createUrlDto);
  }

  @Get('/urls/:shortUrl')
  findOriginalUrl(
    @Param('shortUrl') shortUrl: string,
  ): Promise<OriginalUrlDto> {
    return this.urlService.findOriginalUrl(shortUrl);
  }

  @Get('/:shortUrl')
  @Redirect('', 301)
  async redirectToOriginalUrl(
    @Param('shortUrl') shortUrl: string,
  ): Promise<{ url: string }> {
    const originalUrl: OriginalUrlDto =
      await this.urlService.findOriginalUrl(shortUrl);

    return { url: originalUrl.original };
  }
}
