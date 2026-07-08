import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { CreateUrlDto, UrlDto } from './url.dto';

@Injectable()
export class UrlService {
  constructor(
    @Inject('URL_REPOSITORY')
    private razonesSocialesRepository: Repository<Url>,
  ) {}

  async findAllUrls(): Promise<UrlDto[]> {
    return this.razonesSocialesRepository.find();
  }

  async createUrl(createUrlDto: CreateUrlDto): Promise<CreateUrlDto> {
    const razonesSociales = this.razonesSocialesRepository.create({
      original: createUrlDto.original,
      short: 'EXAMPLE',
    });
    await this.razonesSocialesRepository.save(razonesSociales);
    return createUrlDto;
  }
}
