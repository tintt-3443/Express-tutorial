import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../config/ormconfig';
import { Author } from '../entities/Author';
import i18next from 'i18next';
import { body, validationResult } from 'express-validator';

const authorRepository = AppDataSource.getRepository(Author);

export const authorList = asyncHandler(async (req: Request, res: Response) => {
  const authors = await authorRepository.find({
    order: { family_name: 'ASC' },
  });
  res.render('authors/index', { authors });
});

export const authorDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-author'));
        res.redirect('/authors');
      }
      const author = await authorRepository.findOne({
        relations: ['books'],
        where: { id: id },
      });

      if (author === null) {
        req.flash('error', req.t('home.no-author'));
        res.redirect('/authors');
      }
      const book_ = author?.books || [];
      res.render('authors/detail', {
        author,
        books: book_,
        flash: {
          error: req.flash('error'),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export const authorDeleteGet = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      req.flash('error', req.t('home.no-author'));
      res.redirect('/authors');
    }
    // Get details of author and all their books
    const author = await authorRepository.findOne({
      where: { id: id },
      relations: ['books'],
    });
    if (author === null) {
      req.flash('error', req.t('home.no-author'));
      res.redirect('/authors');
    }
    const allBooksByAuthor = author?.books;
    res.render('authors/form_author_delete', {
      title: 'Delete Author',
      author: author,
      authorBooks: allBooksByAuthor,
    });
  }
);
export const authorDeletePost = asyncHandler(
  async (req: Request, res: Response) => {
    // Do the same authorDeleteGet method: get author and book by author
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      req.flash('error', req.t('home.no-author'));
      res.redirect('/authors');
    }
    // Get details of author and all their books
    const author = await authorRepository.findOne({
      where: { id: id },
      relations: ['books'],
    });
    if (author === null) {
      req.flash('error', req.t('home.no-author'));
      res.redirect('/authors');
    }
    const allBooksByAuthor = author?.books || [];
    if (allBooksByAuthor.length > 0) {
      res.render('authors/form_author_delete', {
        author: author,
        authorBooks: allBooksByAuthor,
      });
      return;
    } else {
      await authorRepository.delete(id);
      res.redirect('/authors');
    }
  }
);

export const authorCreateGet = asyncHandler(
  async (req: Request, res: Response) => {
    res.render('authors/form_author_update', { title: 'Create new author' });
  }
);

export const postAuthorCreateForm = [
  body('fname', 'First name must be specified.')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => String(i18next.t('form.author_valid fname')))
    .escape(),
  body('famname', 'Family name must be specified.')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => String(i18next.t('form.author_valid faname')))
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage(() => String(i18next.t('form.author_valid faname')))
    .escape(),
  body('dob', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .escape(),
  body('dod', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom((value: Date) => {
      if (value && new Date(value) > new Date()) {
        i18next.t('form.author_valid');
      }
      return true;
    })
    .escape(),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('authors/form_author_update', {
          errors: errors.array(),
        });
        return;
      }
      const author: Author = new Author();
      const { fname, famname, dob, dod } = req.body;
      author.first_name = fname;
      author.family_name = famname;
      author.date_of_birth = new Date(dob);
      author.date_of_death = new Date(dod);

      await authorRepository.save(author);

      res.redirect('/authors');
    } catch (error) {
      req.flash('error', req.t('home.cant-create'));
      res.redirect('/authors');
    }
  }),
];

export const authorUpdateGet = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-author'));
        res.redirect('/authors');
      }
      const author = await authorRepository.findOne({ where: { id: id } });
      res.render('authors/form_author_update', {
        title: 'Update Book',
        author: author,
      });
    } catch (error) {
      req.flash('error', req.t('home.no-update-author'));
      res.redirect('/authors');
    }
  }
);

export const authorUpdatePost = [
  // Convert genre to an array.
  (req: Request, res: Response, next: NextFunction) => {
    let authors = req.body?.author;
    if (!Array.isArray(authors)) {
      authors = typeof authors === 'undefined' ? [] : [authors];
    }
    next();
  },
  body('fname', 'First name must be specified.')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => String(i18next.t('form.author_valid-fname')))
    .escape(),
  body('famname', 'Family name must be specified.')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => String(i18next.t('form.author_valid-1faname')))
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage(() => String(i18next.t('form.author_valid-2faname')))
    .escape(),
  body('dob', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .escape(),
  body('dod', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .custom((value: Date) => {
      if (value && new Date(value) > new Date()) {
        i18next.t('form.author_valid');
      }
      return true;
    })
    .escape(),
  // Handle request after validation and sanitization.
  async (
    req: Request<
      { id: string },
      null,
      { fname: string; famname: string; dob: Date; dod: Date }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = validationResult(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-book'));
        res.redirect('/authors');
      }
      const author = (await authorRepository.findOne({
        where: { id: id },
      })) as Author;

      if (author !== null) {
        const { fname, famname, dob, dod } = req.body;
        author.first_name = fname;
        author.family_name = famname;
        author.date_of_birth = new Date(dob);
        author.date_of_death = new Date(dod);
      } else {
        req.flash('error', req.t('home.no-author'));
        res.redirect('/books');
      }

      if (!errors.isEmpty()) {
        res.render('authors/form_author_update', {
          author,
          errors: errors.array(),
        });
      } else {
        if (author !== null) {
          const r = await authorRepository.save(author);
          res.redirect(`/books/${author.id}`);
        }
      }
    } catch (error) {
      next(error);
    }
  },
];
