import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Author } from './Author';
import { BookGenre } from './BookGenre';
import { BookInstance } from './BookInstance';
import { Common } from './Common';

@Entity()
export class Book extends Common {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  summary: string;

  @Column({ nullable: true })
  isbn: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // FOREIGN KEY

  @ManyToOne(() => Author, (author: Author) => author.id)
  author: Author;

  @OneToMany(() => BookGenre, (bookGenre: BookGenre) => bookGenre.book)
  bookGenres: BookGenre[];

  @OneToMany(
    () => BookInstance,
    (bookInstance: BookInstance) => bookInstance.book
  )
  bookInstances: BookInstance[];
  // METHOD
  url(): string {
    return `/books/${this.id}`;
  }
}
