import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'feature_images' })
export class FeatureImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  createdAt: string;
}
