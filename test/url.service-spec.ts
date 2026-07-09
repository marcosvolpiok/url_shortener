import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { UrlDto } from '../src/url/url.dto';
import { Url } from '../src/url/url.entity';
import { UrlService } from '../src/url/url.service';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: jest.Mocked<Pick<Repository<Url>, 'findOne' | 'query'>>;

  beforeEach(async () => {
    urlRepository = {
      findOne: jest.fn(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: 'URL_REPOSITORY',
          useValue: urlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUrl', () => {
    it('returns the existing url when original already exists', async () => {
      const existingUrl: UrlDto = {
        id: 1n,
        original: 'https://example.com',
        short: '1',
      };

      urlRepository.findOne.mockResolvedValue(existingUrl);

      await expect(
        service.createUrl({ original: 'https://example.com' }),
      ).resolves.toEqual(existingUrl);

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { original: 'https://example.com' },
      });
      expect(urlRepository.query).not.toHaveBeenCalled();
    });

    it('creates a short url when original does not exist', async () => {
      const createdUrl: UrlDto = {
        id: 62n,
        original: 'https://example.com',
        short: '10',
      };

      urlRepository.findOne.mockResolvedValue(null);
      urlRepository.query
        .mockResolvedValueOnce([{ id: '62' }])
        .mockResolvedValueOnce([createdUrl]);

      await expect(
        service.createUrl({ original: 'https://example.com' }),
      ).resolves.toEqual(createdUrl);

      expect(urlRepository.query).toHaveBeenNthCalledWith(
        1,
        "SELECT nextval(pg_get_serial_sequence('public.url', 'id')) AS id",
      );
      expect(urlRepository.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO public.url'),
        ['62', 'https://example.com', '10'],
      );
    });
  });

  describe('generateShortUrl', () => {
    it.each([
      [0n, '0'],
      [1n, '1'],
      [10n, 'a'],
      [61n, 'Z'],
      [62n, '10'],
      [3844n, '100'],
    ])('encodes %s to %s', (id, expectedShortUrl) => {
      expect(service.generateShortUrl(id)).toBe(expectedShortUrl);
    });
  });

  describe('decodeShortUrl', () => {
    it.each([
      ['0', 0n],
      ['1', 1n],
      ['a', 10n],
      ['Z', 61n],
      ['10', 62n],
      ['100', 3844n],
    ])('decodes %s to %s', (shortUrl, expectedId) => {
      expect(service.decodeShortUrl(shortUrl)).toBe(expectedId);
    });

    it('throws BadRequestException when short url is empty', () => {
      expect(() => service.decodeShortUrl('')).toThrow(BadRequestException);
    });

    it('throws BadRequestException when short url has invalid characters', () => {
      expect(() => service.decodeShortUrl('abc!')).toThrow(BadRequestException);
    });

    it('round trips generated short urls back to the original id', () => {
      const id = 123456789n;
      const shortUrl = service.generateShortUrl(id);

      expect(service.decodeShortUrl(shortUrl)).toBe(id);
    });
  });

  describe('findOriginalUrl', () => {
    it('returns the original url for a valid short url', async () => {
      const url: UrlDto = {
        id: 62n,
        original: 'https://example.com',
        short: '10',
      };

      urlRepository.findOne.mockResolvedValue(url);

      await expect(service.findOriginalUrl('10')).resolves.toBe(
        'https://example.com',
      );

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id: '62' },
      });
    });

    it('throws NotFoundException when url does not exist', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      await expect(service.findOriginalUrl('10')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException and does not query the repository when short url is invalid', async () => {
      await expect(service.findOriginalUrl('abc!')).rejects.toThrow(
        BadRequestException,
      );

      expect(urlRepository.findOne).not.toHaveBeenCalled();
    });
  });
});
