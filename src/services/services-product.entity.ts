import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_products' })
export class ServiceProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;
}
