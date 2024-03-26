import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../config/ormconfig';
import { Author } from '../entities/Author';

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
