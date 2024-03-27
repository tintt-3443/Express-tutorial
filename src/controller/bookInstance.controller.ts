import { BookInstance } from '../entities/BookInstance';
import { AppDataSource } from '../config/ormconfig';
import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { StatusBookInstance } from '../constant/enum';
const bookInstanceRepository = AppDataSource.getRepository(BookInstance);

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
