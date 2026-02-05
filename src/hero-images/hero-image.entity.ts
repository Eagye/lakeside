import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hero_images' })
export class HeroImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  createdAt: string;

  @Column()
  expiresAt: string;
}
