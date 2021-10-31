import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Publisher } from "./publisher.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column("decimal", { scale: 2 })
  price: number;

  @Column("simple-array")
  tags: string[];

  @Column("date")
  releaseDate: string;

  @ManyToOne(() => Publisher)
  @JoinColumn({ name: 'publisherId' })
  publisher: Publisher;
}
