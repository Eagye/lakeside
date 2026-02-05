import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'news_images' })
export class NewsImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  newsId: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({ default: '' })
  caption: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  createdAt: string;
}
