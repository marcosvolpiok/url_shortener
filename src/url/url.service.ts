import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { CreateUrlDto, UrlDto } from './url.dto';

@Injectable()
export class UrlService {
  private readonly base62Dictionary =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  constructor(
    @Inject('URL_REPOSITORY')
    private urlRepository: Repository<Url>,
  ) {}

  async createUrl(createUrlDto: CreateUrlDto): Promise<UrlDto> {
    this.validateOriginalUrl(createUrlDto.original);

    const existingUrl = await this.urlRepository.findOne({
      where: { original: createUrlDto.original },
    });

    if (existingUrl) {
      return existingUrl;
    }

    const id = await this.getNextUrlId();
    const short = this.generateShortUrl(id);

    // Inserta explícitamente el id reservado para no consumir otra vez la sequence.
    const [url]: UrlDto[] = await this.urlRepository.query(
      `INSERT INTO public.url (id, original, short)
       VALUES ($1, $2, $3)
       ON CONFLICT (original) DO UPDATE SET original = EXCLUDED.original
       RETURNING id, original, short`,
      [id.toString(), createUrlDto.original, short],
    );

    return url;
  }

  private validateOriginalUrl(originalUrl: string): void {
    if (
      typeof originalUrl !== 'string' ||
      originalUrl.length === 0 ||
      originalUrl.trim() !== originalUrl
    ) {
      throw new BadRequestException('Original URL must be a valid URL');
    }

    try {
      const url = new URL(originalUrl);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new BadRequestException('Original URL must be a valid URL');
      }
    } catch {
      throw new BadRequestException('Original URL must be a valid URL');
    }
  }

  private async getNextUrlId(): Promise<bigint> {
    const [result]: { id: string }[] = await this.urlRepository.query(
      "SELECT nextval(pg_get_serial_sequence('public.url', 'id')) AS id",
    );

    return BigInt(result.id);
  }

  generateShortUrl(id: bigint): string {
    let shortUrl = '';
    let number = id;

    if (number === 0n) {
      return this.base62Dictionary[0];
    }

    // Encodea el id en base62 dividiendo por 62 y guardando los restos.
    while (number > 0n) {
      const remainder = number % 62n;
      shortUrl += this.base62Dictionary[Number(remainder)];
      number = number / 62n;
    }

    // Los restos se obtienen de derecha a izquierda, por eso se invierte.
    return shortUrl.split('').reverse().join('');
  }

  decodeShortUrl(shortUrl: string): bigint {
    if (!shortUrl) {
      throw new BadRequestException('Short URL is required');
    }

    let id = 0n;

    // Decodea la base62 multiplicando el acumulado por 62 y sumando el valor.
    for (const character of shortUrl) {
      const characterValue = this.base62Dictionary.indexOf(character);

      if (characterValue === -1) {
        throw new BadRequestException('Short URL has invalid characters');
      }

      id = id * 62n + BigInt(characterValue);
    }

    return id;
  }

  async findOriginalUrl(shortUrl: string): Promise<string> {
    const id = this.decodeShortUrl(shortUrl);
    const url = await this.urlRepository.findOne({
      where: { id: id.toString() as unknown as bigint },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return url.original;
  }
}
