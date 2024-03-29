import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../config/ormconfig';
import { Author } from '../entities/Author';
import { Book } from '../entities/Book';
import { Genre } from '../entities/Genre';
import { BookInstance } from '../entities/BookInstance';
import { StatusBookInstance } from '../constant/enum';
import i18next from 'i18next';
import { body, validationResult } from 'express-validator';
import { BookGenre } from '../entities/BookGenre';

const bookRepository = AppDataSource.getRepository(Book);
const authorRepository = AppDataSource.getRepository(Author);
const genreRepository = AppDataSource.getRepository(Genre);
const bookInstanceRepository = AppDataSource.getRepository(BookInstance);
const bookGenreRepository = AppDataSource.getRepository(BookGenre);
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

export const bookList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await bookRepository.find({
        order: { title: 'ASC' },
        relations: ['author'],
      });
      res.render('books/index', { books });
    } catch (error) {
      next(error);
    }
  }
);

export const bookDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/books');
      }
      const book = await bookRepository.findOne({
        relations: [
          'author',
          'bookGenres',
          'bookGenres.genre',
          'bookInstances',
        ],
        where: { id: id },
      });
      if (book === null) {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/books');
      }
      const genre_ = Array.isArray(book?.bookGenres)
        ? book.bookGenres.map((bookGenre) => bookGenre.genre)
        : [];
      res.render('books/detail', {
        book,
        book_instances: book?.bookInstances,
        genres: genre_,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const bookUpdateGet = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/books');
      }
      const [book, allAuthors, allGenres] = await Promise.all([
        bookRepository.findOne({
          where: { id: id },
          relations: ['author'],
        }),
        authorRepository.find({}),
        genreRepository.find({}),
      ]);
      res.render('books/form_book_update', {
        authors: allAuthors,
        genres: allGenres,
        book: book,
      });
    } catch (error) {
      req.flash('error', req.t('home.no-update-book'));
      res.redirect('/books');
    }
  }
);

export const bookUpdatePost = [
  // Convert genre to an array.
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body?.genre === 'undefined' ? [] : [req.body?.genre];
    }
    next();
  },
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.title_valid'))
    .escape(),
  body('author')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.author_valid'))
    .escape(),
  body('summary')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.summary_valid'))
    .escape(),
  body('isbn')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.isbn_valid'))
    .escape(),
  body('genre.*').escape(),

  // Handle request after validation and sanitization.
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/books');
      }
      const [book, allAuthors, allGenres] = await Promise.all([
        bookRepository.findOne({ where: { id: id } }),
        authorRepository.find({}),
        genreRepository.find({}),
      ]);

      if (book !== null) {
        book.title = req.body.title;
        book.author = req.body.author;
        book.summary = req.body.summary;
        book.isbn = req.body.isbn;
      } else {
        req.flash('error', req.t('home.no_book'));
        res.redirect('/books');
      }

      if (!errors.isEmpty()) {
        res.render('books/form_book_update', {
          authors: allAuthors,
          genres: allGenres,
          book: book,
          errors: errors.array(),
        });
      } else {
        if (book !== null) {
          const r1 = await bookRepository.save(book);
          const r2 = await bookGenreRepository.delete({ book: book });
          for (const genreId of req.body?.genre) {
            const bookGenre = new BookGenre();
            bookGenre.book = book;
            bookGenre.genre = genreId;
            const r3 = await bookGenreRepository.save(bookGenre);
          }
          res.redirect(`/books/${book.id}`);
        }
      }
    } catch (error) {
      next(error);
    }
  },
];

export const bookCreateGet = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const [allAuthors, allGenres] = await Promise.all([
      authorRepository.find({}),
      genreRepository.find({}),
    ]);
    res.render('books/form_book_update', {
      authors: allAuthors,
      genres: allGenres,
    });
  }
);

export const postBookCreateForm = [
  body('title', 'First name must be specified.')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => String(i18next.t('form.title_valid')))
    .escape(),
  body('author', 'Family name must be specified.')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => String(i18next.t('form.author_valid')))
    .escape(),
  body('summary', 'Invalid date of birth')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => String(i18next.t('form.summary_valid')))
    .escape(),
  body('isbn', 'Invalid date of death')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => String(i18next.t('form.isbn_valid')))
    .escape(),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      const { title, author, summary, isbn, genre } = req.body;
      const book = new Book();
      book.title = title;
      book.author = author;
      book.summary = summary;
      book.isbn = isbn;

      const [allAuthors, allGenres] = await Promise.all([
        authorRepository.find({ order: { family_name: 'ASC' } }),
        genreRepository.find({ order: { name: 'ASC' } }),
      ]);

      if (!errors.isEmpty()) {
        res.render('books/form_book_update', {
          authors: allAuthors,
          genres: allGenres,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Save book.
        await bookRepository.save(book);

        for (const genreId of genre) {
          const bookGenre = new BookGenre();
          bookGenre.book = book;
          bookGenre.genre = genreId;
          await bookGenreRepository.save(bookGenre);
        }
        res.redirect('/books');
      }
    } catch (error) {
      req.flash('error', req.t('home.cant-create'));
      res.redirect('/books');
    }
  }),
];

export const bookDeleteGet = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      req.flash('error', req.t('home.no-book'));
      res.redirect('/books');
    }
    // Get details of book and all their books
    const book = await bookRepository.findOne({
      where: { id: id },
      relations: ['author', 'bookInstances', 'bookGenres', 'bookGenres.genre'],
    });
    if (book === null) {
      req.flash('error', req.t('home.no-book'));
      res.redirect('/books');
    }
    res.render('books/form_book_delete', {
      book: book,
      bookInstances: book?.bookInstances,
      genres: book?.bookGenres.map((bookGenre) => bookGenre.genre),
      author: book?.author,
      statusBookInstance: StatusBookInstance,
    });
  }
);
export const bookDeletePost = asyncHandler(
  async (req: Request, res: Response) => {
    // Do the same bookDeleteGet method: get author and book by author
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      req.flash('error', req.t('home.no-author'));
      res.redirect('/authors');
    }
    // Get details of author and all their books
    const book = await bookRepository.findOne({
      where: { id: id },
      relations: ['author', 'bookInstances', 'bookGenres', 'bookGenres.genre'],
    });
    if (book === null) {
      req.flash('error', req.t('home.no-book'));
      res.redirect('/books');
    }
    const lengthBookI = book?.bookInstances.length || 0;
    if (0 < lengthBookI) {
      res.render('authors/form_author_delete', {
        title: 'Delete Author',
        book: book,
        bookInstances: book?.bookInstances,
        genres: book?.bookGenres.map((bookGenre) => bookGenre.genre),
        author: book?.author,
      });
      return;
    } else {
      if (book !== null) {
        await bookGenreRepository.delete({ book: book });
        await bookRepository.delete(id);
      }
      res.redirect('/books');
    }
  }
);
