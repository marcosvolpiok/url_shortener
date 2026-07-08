import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'url', schema: 'public' })
export class Url {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'text', unique: true })
  original: string;

  @Column({ type: 'text', unique: true })
  short: string;
}
