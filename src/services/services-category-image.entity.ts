import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_category_images' })
export class ServiceCategoryImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  createdAt: string;
}
