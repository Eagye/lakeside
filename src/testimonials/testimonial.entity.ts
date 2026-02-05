import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'testimonials' })
export class TestimonialEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  role: string;

  @Column()
  quote: string;

  @Column({ default: 5 })
  rating: number;

  @Column({ default: '' })
  avatarUrl: string;

  @Column({ default: 0 })
  sortOrder: number;
}
