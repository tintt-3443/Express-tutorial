import { Entity, Column, OneToMany } from 'typeorm';
import { Book } from './Book';
import { Common } from './Common';

@Entity()
export class Author extends Common {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  family_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  date_of_death: Date;

  // FOREIGN KEY
  @OneToMany(() => Book, (book: Book) => book.id)
  books: Book[];
  // METHOD
  get name(): string {
    return `${this.first_name} ${this.family_name}`;
  }

  get url(): string {
    return 'something';
  }
}
