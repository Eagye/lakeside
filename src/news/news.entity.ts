import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'news' })
export class NewsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', default: '' })
  excerpt: string;

  @Column({ default: '' })
  author: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: true })
  published: boolean;

  @Column()
  publishDate: string;

  @Column({ default: '' })
  coverImageUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  createdAt: string;

  @Column({ default: '' })
  updatedAt: string;
}
