import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { OfferCardEntity } from './offer-card.entity';
import { OfferImageEntity } from './offer-image.entity';

const OFFER_CARD_LIMIT = 4;
const OFFER_IMAGE_LIMIT = 10;

@Injectable()
export class OfferService implements OnModuleInit {
  constructor(
    @InjectRepository(OfferCardEntity)
    private readonly offerCardRepository: Repository<OfferCardEntity>,
    @InjectRepository(OfferImageEntity)
    private readonly offerImageRepository: Repository<OfferImageEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureSeeded();
  }

  async listCardsWithImages() {
    const cards = await this.offerCardRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const images = await this.offerImageRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return cards.map((card) => ({
      ...card,
      images: images.filter((image) => image.offerCardId === card.id),
    }));
  }

  async listCards() {
    return this.offerCardRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async updateCard(id: number, label: string) {
    if (!label) {
      throw new BadRequestException('Label is required');
    }
    const card = await this.offerCardRepository.findOne({ where: { id } });
    if (!card) {
      throw new BadRequestException('Offer card not found');
    }
    card.label = label;
    return this.offerCardRepository.save(card);
  }

  async listImages(offerCardId: number) {
    return this.offerImageRepository.find({
      where: { offerCardId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async addImages(offerCardId: number, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }

    const card = await this.offerCardRepository.findOne({
      where: { id: offerCardId },
    });
    if (!card) {
      throw new BadRequestException('Offer card not found');
    }

    const count = await this.offerImageRepository.count({
      where: { offerCardId },
    });
    if (count + files.length > OFFER_IMAGE_LIMIT) {
      throw new BadRequestException(
        `Offer images limit is ${OFFER_IMAGE_LIMIT}`,
      );
    }

    const now = new Date().toISOString();
    const existing = await this.offerImageRepository.find({
      where: { offerCardId },
      order: { sortOrder: 'DESC', id: 'DESC' },
      take: 1,
    });
    const startOrder = existing[0]?.sortOrder ?? 0;

    const entities = files.map((file, index) =>
      this.offerImageRepository.create({
        offerCardId,
        filename: file.filename,
        url: `/uploads/offers/${file.filename}`,
        sortOrder: startOrder + index + 1,
        createdAt: now,
      }),
    );
    return this.offerImageRepository.save(entities);
  }

  async deleteImage(id: number) {
    const image = await this.offerImageRepository.findOne({ where: { id } });
    if (!image) {
      return;
    }
    await this.offerImageRepository.delete({ id });
    await this.safeDeleteFile(
      join(process.cwd(), 'public', image.url.replace(/^\//, '')),
    );
  }

  private async ensureSeeded() {
    const count = await this.offerCardRepository.count();
    if (count > 0) {
      return;
    }
    const labels = [
      'Agriculture Products',
      'Organic Products',
      'Fresh Vegetables',
      'Dairy Products',
    ];
    const cards = labels.map((label, index) =>
      this.offerCardRepository.create({ label, sortOrder: index }),
    );
    await this.offerCardRepository.save(cards.slice(0, OFFER_CARD_LIMIT));
  }

  private async safeDeleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch {
      return;
    }
  }
}
