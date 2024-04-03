import { BookInstance } from '../entities/BookInstance';
import { AppDataSource } from '../config/ormconfig';
import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { StatusBookInstance } from '../constant/enum';
import { Book } from '../entities/Book';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
const bookInstanceRepository = AppDataSource.getRepository(BookInstance);
const bookRepository = AppDataSource.getRepository(Book);

export const bookIStanceList = asyncHandler(
  async (req: Request, res: Response) => {
    const bookInstances = await bookInstanceRepository.find({
      order: { status: 'ASC' },
      relations: ['book', 'book.author'],
    });
    res.render('book-instances/index', {
      bookInstances,
      bookingStatus: StatusBookInstance,
    });
  }
);

export const bookIstanceDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-book-instance'));
        res.redirect('/book-instances');
      }
      const bookinstance = await bookInstanceRepository.findOne({
        relations: ['book'],
        where: { id: id },
      });

      if (bookinstance === null) {
        req.flash('error', req.t('home.no-book-instance'));
        res.redirect('/book-instances');
      }
      const book_ = bookinstance?.book;

      res.render('book-instances/detail', {
        bookinstance,
        book: book_,
        bookingStatus: StatusBookInstance,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const bookInstanceCreateGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const books = await bookRepository.find();
    const status = Object.entries(StatusBookInstance);
    res.render('book-instances/form_book-instance_update', {
      title: 'Create new book-instance',
      books: books,
      bookIStatus: status,
    });
  }
);

export const postBookInstanceCreateForm = [
  body('imprint')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('form.imprint_valid'))
    .escape(),
  body('book')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.book_valid'))
    .escape(),
  body('dob', 'Invalid date due back')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .escape(),
  body('status')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('form.status_valid'))
    .escape(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await bookRepository.find();
      const status = Object.entries(StatusBookInstance);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('book-instances/form_book-instance_update', {
          errors: errors.array(),
          books: books,
          bookIStatus: status,
        });
        return;
      }
      const book = await bookRepository.findOne({
        where: { id: req.body?.book },
      });
      const bookI = new BookInstance();

      if (book) {
        bookI.imprint = req.body?.imprint;
        bookI.book = book;
        bookI.status = req.body?.status;
        bookI.due_back = new Date(req.body?.dueback);
      } else {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/book-instances');
      }
      const bookIExists = await bookInstanceRepository.findOne({
        where: { imprint: req.body?.imprint },
      });

      if (bookIExists) {
        res.redirect('/book-instances');
      } else {
        await bookInstanceRepository.save(bookI);
        res.redirect('/book-instances');
      }
    } catch (error) {
      req.flash('error', req.t('home.cant-create'));
      res.redirect('/book-instances');
    }
  }),
];

export const bookInstanceUpdateGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const books = await bookRepository.find();
    const bookInstance = await bookInstanceRepository.findOne({
      where: { id: id },
      relations: ['book'],
    });
    const status = Object.entries(StatusBookInstance);
    res.render('book-instances/form_book-instance_update', {
      bookInstance: bookInstance,
      books: books,
      bookIStatus: status,
    });
  }
);

export const bookInstanceUpdatePost = [
  // Convert genre to an array.
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.bookInstance)) {
      req.body.bookInstance =
        typeof req.body?.bookInstance === 'undefined'
          ? []
          : [req.body?.bookInstance];
    }
    next();
  },
  body('imprint')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('form.imprint_valid'))
    .escape(),
  body('book')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.book_valid'))
    .escape(),
  body('dob', 'Invalid date due back')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .escape(),
  body('status')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('form.status_valid'))
    .escape(),

  // Handle request after validation and sanitization.
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/books');
      }
      const bookI = await bookInstanceRepository.findOne({
        where: { id: id },
      });
      if (bookI !== null) {
        bookI.imprint = req.body?.imprint;
        bookI.status = req.body?.status;
        bookI.due_back = new Date(req.body?.dueback);
        bookI.book = req.body?.book;
        const books = await bookRepository.find();
        const status = Object.entries(StatusBookInstance);
        if (!errors.isEmpty()) {
          res.render('books/form_book_update', {
            bookInstance: bookI,
            books: books,
            bookIStatus: status,
            errors: errors.array(),
          });
        } else {
          await bookInstanceRepository.save(bookI);
          res.redirect('/book-instances');
        }
      } else {
        req.flash('error', req.t('home.no_book_instance'));
        res.redirect('/book-instances');
      }
    } catch (error) {
      next(error);
    }
  },
];

export const bookInstanceDeleteGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      req.flash('error', req.t('home.no-book-instance'));
      res.redirect('/book-instances');
    }
    const bookInstance = await bookInstanceRepository.findOne({
      where: { id: id },
      relations: ['book'],
    });

    const status = Object.entries(StatusBookInstance);
    res.render('book-instances/form_book-instance_delete', {
      bookInstance: bookInstance,
      bookIStatus: status,
    });
  }
);

export const bookInstancesDeletePost = asyncHandler(
  async (req: Request, res: Response) => {
    // Do the same bookDeleteGet method: get author and book by author
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      req.flash('error', req.t('home.no-author'));
      res.redirect('/authors');
    }
    // Get details of author and all their books
    const bookI = await bookInstanceRepository.findOne({
      where: { id: id },
    });
    if (bookI === null) {
      req.flash('error', req.t('home.no-book'));
      res.redirect('/books');
    }
    const status = Object.entries(StatusBookInstance);
    if (!bookI) {
      res.render('authors/form_author_delete', {
        bookInstance: bookI,
        bookIStatus: status,
      });
      return;
    } else {
      if (bookI !== null) {
        const r = await bookInstanceRepository.remove(bookI);
      }
      res.redirect('/book-instaces');
    }
  }
);
