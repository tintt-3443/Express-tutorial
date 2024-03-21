import { Entity, ManyToOne } from 'typeorm';
import { Book } from './Book';
import { Genre } from './Genre';
import { Common } from './Common';

@Entity()
export class BookGenre extends Common {
  // FOREIGN KEY
  @ManyToOne(() => Book, (book: Book) => book.id)
  book: Book;

  @ManyToOne(() => Genre, (genre: Genre) => genre.id)
  genre: Genre;
  // METHOD
  get url(): string {
    return 'something';
  }
}
