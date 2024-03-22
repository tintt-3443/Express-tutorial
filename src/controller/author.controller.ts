import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../config/ormconfig';
import { Author } from '../entities/Author';

const authorRepository = AppDataSource.getRepository(Author);

export const getAuthor = asyncHandler(async (req: Request, res: Response) => {
  res.send('NOT IMPLEMENTED: Author create GET');
});

export const createAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    res.send('NOT IMPLEMENTED: Author create POST');
  }
);
export const updateAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    res.send('NOT IMPLEMENTED: Author update PATCH');
  }
);
