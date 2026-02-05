import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'offer_images' })
export class OfferImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  offerCardId: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  createdAt: string;
}
