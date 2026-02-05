import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialEntity } from './testimonial.entity';

const TESTIMONIAL_LIMIT = 10;

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepository: Repository<TestimonialEntity>,
  ) {}

  // Removed auto-seeding on module init
  // If you need to seed testimonials, use the admin panel

  async listTestimonials() {
    return this.testimonialRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async createTestimonial(
    name: string,
    role: string,
    quote: string,
    rating = 5,
  ) {
    if (!name || !quote) {
      throw new BadRequestException('Name and quote are required');
    }
    const count = await this.testimonialRepository.count();
    if (count >= TESTIMONIAL_LIMIT) {
      throw new BadRequestException(
        `Testimonials limit is ${TESTIMONIAL_LIMIT}`,
      );
    }
    const entity = this.testimonialRepository.create({
      name,
      role: role ?? '',
      quote,
      rating: Math.min(Math.max(rating, 1), 5),
      sortOrder: count,
    });
    return this.testimonialRepository.save(entity);
  }

  async updateTestimonial(
    id: number,
    name: string,
    role: string,
    quote: string,
    rating: number,
  ) {
    if (!name || !quote) {
      throw new BadRequestException('Name and quote are required');
    }
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
    });
    if (!testimonial) {
      throw new BadRequestException('Testimonial not found');
    }
    testimonial.name = name;
    testimonial.role = role ?? '';
    testimonial.quote = quote;
    testimonial.rating = Math.min(Math.max(rating ?? testimonial.rating, 1), 5);
    return this.testimonialRepository.save(testimonial);
  }

  async updateAvatar(id: number, avatarUrl: string) {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
    });
    if (!testimonial) {
      throw new BadRequestException('Testimonial not found');
    }
    testimonial.avatarUrl = avatarUrl ?? '';
    return this.testimonialRepository.save(testimonial);
  }

  async deleteTestimonial(id: number) {
    await this.testimonialRepository.delete({ id });
  }
}
