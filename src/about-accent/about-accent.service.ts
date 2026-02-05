import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutAccentImage } from './about-accent-image.entity';

@Injectable()
export class AboutAccentService {
  constructor(
    @InjectRepository(AboutAccentImage)
    private readonly accentImageRepository: Repository<AboutAccentImage>,
  ) {}

  async findAll(): Promise<AboutAccentImage[]> {
    return this.accentImageRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(imageUrl: string): Promise<AboutAccentImage> {
    const maxOrder = await this.accentImageRepository
      .createQueryBuilder('img')
      .select('MAX(img.displayOrder)', 'max')
      .getRawOne();

    const image = this.accentImageRepository.create({
      imageUrl,
      displayOrder: (maxOrder?.max ?? -1) + 1,
    });

    return this.accentImageRepository.save(image);
  }

  async delete(id: number): Promise<void> {
    await this.accentImageRepository.delete(id);
  }

  async updateOrder(id: number, displayOrder: number): Promise<AboutAccentImage | null> {
    await this.accentImageRepository.update(id, { displayOrder });
    return this.accentImageRepository.findOne({ where: { id } });
  }
}
