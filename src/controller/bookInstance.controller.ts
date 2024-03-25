import { BookInstance } from '../entities/BookInstance';
import { AppDataSource } from '../config/ormconfig';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
const bookInstanceRepository = AppDataSource.getRepository(BookInstance);

export const bookIStanceList = asyncHandler(
  async (req: Request, res: Response) => {
    const bookInstances = await bookInstanceRepository.find({
      order: { status: 'ASC' },
      relations: ['book'],
    });
    res.render('book-instances/index', {
      bookInstances,
    });
  }
);
