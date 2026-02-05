import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'about_intro_images' })
export class AboutIntroImageEntity {
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
