import { Request, Response } from 'express';
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
