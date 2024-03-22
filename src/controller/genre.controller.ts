import { Genre } from '../entities/Genre';
import { AppDataSource } from '../config/ormconfig';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
const genreRepository = AppDataSource.getRepository(Genre);

export const genreList = asyncHandler(async (req: Request, res: Response) => {
  const genres = await genreRepository.find({
    order: { name: 'ASC' },
  });
  res.render('genres/index', {
    genres,
  });
});
