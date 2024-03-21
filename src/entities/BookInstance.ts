import { Entity, Column, ManyToOne } from 'typeorm';
import { Book } from './Book';
import { Common } from './Common';

@Entity()
export class BookInstance extends Common {
  @Column({ nullable: false })
  imprint: string;

  @Column({ nullable: false })
  status: string;

  @Column({ type: 'date', nullable: true })
  due_back: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // FOREIGN KEY
  @ManyToOne(() => Book, (book: Book) => book.id)
  book: Book;
  // METHOD
  get url(): string {
    return 'something';
  }
}
