import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { Photo } from "./Photo";

@Entity()
export class Author {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToOne(type => Photo, photo => photo.author)
  photos: Photo[];
}