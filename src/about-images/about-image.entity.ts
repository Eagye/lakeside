import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'about_images' })
export class AboutImageEntity {
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
