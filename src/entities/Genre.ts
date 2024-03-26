import { Entity, Column, OneToMany } from 'typeorm';
import { BookGenre } from './BookGenre';
import { Common } from './Common';

@Entity()
export class Genre extends Common {
  @Column({ nullable: false })
  name: string;

  // FOREIGN KEY
  @OneToMany(() => BookGenre, (bookGenre: BookGenre) => bookGenre.genre)
  bookGenres: BookGenre[];

  // METHOD
  url(): string {
    return `genres/${this.id}`;
  }
}
