import { Genre } from '../entities/Genre';
import { AppDataSource } from '../config/ormconfig';
import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
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
