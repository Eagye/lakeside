import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { AboutContent, HomeContent } from './content.types';

@Entity({ name: 'site_content' })
export class ContentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-json' })
  home: HomeContent;

  @Column({ type: 'simple-json' })
  about: AboutContent;

  @Column()
  updatedAt: string;
}
