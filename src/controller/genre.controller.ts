import { Genre } from '../entities/Genre';
import { AppDataSource } from '../config/ormconfig';
import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import i18next from 'i18next';
const genreRepository = AppDataSource.getRepository(Genre);

export const genreList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const genres = await genreRepository.find({
        order: { name: 'ASC' },
      });

      res.render('genres/index', {
        genres,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const genreDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        req.flash('error', req.t('home.no-genre'));
        res.redirect('/genres');
      }
      const genre = await genreRepository.findOne({
        relations: ['bookGenres', 'bookGenres.book'],
        where: { id: id },
      });

      if (genre === null) {
        req.flash('error', req.t('home.no-genre'));
        res.redirect('/genres');
      }
      const book_ = Array.isArray(genre?.bookGenres)
        ? genre?.bookGenres.map((bg) => bg.book)
        : [];
      res.render('genres/detail', {
        genre,
        books: book_,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const genreCreateGet = asyncHandler(
  async (req: Request, res: Response) => {
    res.render('genres/form_genre_update', { title: 'Create new genre' });
  }
);

export const postGenreCreateForm = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage(() => i18next.t('form.genre_valid'))
    .escape(),

  asyncHandler(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('genres/form_genre_update', {
          errors: errors.array(),
        });
        return;
      }
      const genre = new Genre();
      genre.name = req.body?.name;

      const genreExists = await genreRepository.findOne({
        where: { name: req.body.name },
      });

      if (genreExists) {
        res.redirect('/genres');
      } else {
        await genreRepository.save(genre);
        res.redirect('/genres');
      }
    } catch (error) {
      req.flash('error', req.t('home.cant-create'));
      res.redirect('/genres');
    }
  }),
];

export const genreUpdateGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const genre = await genreRepository.findOne({
      where: { id: id },
    });
    res.render('genres/form_genre_update', {
      genre,
    });
  }
);

export const postGenreUpdateForm = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage(() => i18next.t('form.genre_valid'))
    .escape(),

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const genre = await genreRepository.findOne({
        where: { id: id },
      });
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('genres/form_genre_update', {
          errors: errors.array(),
          genre,
        });
        return;
      }

      const genreExists = await genreRepository.findOne({
        where: { name: req.body.name },
      });

      if (genreExists) {
        res.redirect('/genres');
      } else {
        if (genre) {
          genre.name = req.body?.name;
          await genreRepository.save(genre);
          res.redirect('/genres');
        }
      }
    } catch (error) {
      req.flash('error', req.t('home.cant-create'));
      res.redirect('/genres');
    }
  }),
];

export const genreDeleteGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const genre = await genreRepository.findOne({
      where: { id: id },
      relations: ['bookGenres', 'bookGenres.book'],
    });

    if (genre === null) {
      req.flash('error', req.t('home.no-genre'));
      res.redirect('/genres');
    }
    const books = Array.isArray(genre?.bookGenres)
      ? genre?.bookGenres.map((bg) => bg.book)
      : [];
    res.render('genres/form_genre_delete', {
      genre,
      books,
    });
  }
);
