import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'offer_cards' })
export class OfferCardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ default: 0 })
  sortOrder: number;
}
