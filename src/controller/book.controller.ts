import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../config/ormconfig';
import { Author } from '../entities/Author';
import { Book } from '../entities/Book';
import { Genre } from '../entities/Genre';
import { BookInstance } from '../entities/BookInstance';
import { StatusBookInstance } from '../constant/enum';
import i18next from 'i18next';

const bookRepository = AppDataSource.getRepository(Book);
const authorRepository = AppDataSource.getRepository(Author);
const genreRepository = AppDataSource.getRepository(Genre);
const bookInstanceRepository = AppDataSource.getRepository(BookInstance);
export const index = asyncHandler(async (req: Request, res: Response) => {
  const [
    numBooks,
    numBookInstances,
    availableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    bookRepository.count(),
    bookInstanceRepository.count(),
    bookInstanceRepository.findAndCount({
      where: { status: StatusBookInstance.AVAILABLE },
    }),
    authorRepository.count(),
    genreRepository.count(),
  ]);
  res.render('index', {
    i18next: i18next,
    title: 'Local library home',
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: availableBookInstances[1],
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

export const bookList = asyncHandler(async (req: Request, res: Response) => {
  const books = await bookRepository.find({
    order: { title: 'ASC' },
    relations: ['author'],
  });
  res.render('books/index', { books });
});
