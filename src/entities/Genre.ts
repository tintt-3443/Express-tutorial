import { Entity, Column, OneToMany } from 'typeorm';
import { BookGenre } from './BookGenre';
import { Common } from './Common';

@Entity()
export class Genre extends Common {
  @Column({ nullable: false })
  name: string;

  // FOREIGN KEY
  @OneToMany(() => BookGenre, (bookGenre: BookGenre) => bookGenre.id)
  bookGenres: BookGenre[];

  // METHOD
  get url(): string {
    return 'something';
  }
}
