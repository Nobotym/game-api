import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { Publisher } from './entities/publisher.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepo: Repository<Game>,
    @InjectRepository(Publisher) private readonly publisherRepo: Repository<Publisher>,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const newGame = this.gameRepo.create(createGameDto);
    newGame.publisher = await this.publisherRepo.findOne(createGameDto.publisherId);
    await this.gameRepo.save(newGame);
    return this.gameRepo.findOne(newGame.id, {relations: ['publisher']});
  }

  async findAll(): Promise<Game[]> {
    return this.gameRepo.find({relations: ['publisher']});
  }

  async findOne(id: string): Promise<Game> {
    return this.gameRepo.findOne(id, {relations: ['publisher']});
  }

  async update(id: string, updateGameDto: UpdateGameDto): Promise<boolean> {
    updateGameDto.publisher = await this.publisherRepo.findOne(updateGameDto.publisherId);
    delete updateGameDto.publisherId;
    const result = await this.gameRepo.update(id, updateGameDto);
    return !!result.affected;
  }

  async remove(id: string): Promise<boolean>  {
    const result = await this.gameRepo.delete(id);
    return !!result.affected;
  }

  async getPublisher(id: string): Promise<Publisher|null|false> {
    const game = await this.gameRepo.findOne(id, {relations: ['publisher']})
    if (!game)
      return false

    return game.publisher;
  }

  async cleanGames(): Promise<boolean> {
    const deleteDate = new Date();
    const discountDate = new Date();
    deleteDate.setMonth(deleteDate.getMonth() - 18);
    discountDate.setMonth(discountDate.getMonth() - 12);
    await this.gameRepo.delete({
      releaseDate: LessThan(deleteDate.toISOString())
    })
    await this.gameRepo.update({
      releaseDate: LessThanOrEqual(discountDate.toISOString())
    }, {
      price: () => "price * 0.8"
    })

    return true
  }
}
