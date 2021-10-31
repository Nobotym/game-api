import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { Publisher } from './entities/publisher.entity';
import { NotFoundException } from '@nestjs/common';

const GameExample = {title: 'The Best Game Ever', price: 10.10, publisherId: '', tags: ['bestseller', 'RPG'], releaseDate: '2020-01-01'};

describe('GameController', () => {
  let controller: GameController;
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [Game, Publisher],
          synchronize: true,
          autoLoadEntities: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([Game, Publisher]),
      ],
      controllers: [GameController],
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
    controller = module.get<GameController>(GameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create() in game.service', () => {
      const newGameDTO: CreateGameDto = GameExample;
      service.create = jest.fn().mockResolvedValue({});
      controller.create(newGameDTO);
      expect(service.create).toHaveBeenCalledWith(newGameDTO);
    })
  })

  describe('findAll', () => {
    it('should call findAll() in game.service', () => {
      service.findAll = jest.fn().mockResolvedValue({});
      controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith();
    })
  })

  describe('findOne', () => {
    it('should call findOne() in game.service', () => {
      service.findOne = jest.fn().mockResolvedValue(true);
      controller.findOne('foo');
      expect(service.findOne).toHaveBeenCalledWith('foo');
    })

    it('should return exception', async () => {
      try {
        service.findOne = jest.fn().mockResolvedValue(false);
        await controller.findOne('foo');
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    })
  })

  describe('update', () => {
    it('should call update() in game.service', () => {
      const updateGameDTO: UpdateGameDto = GameExample;
      service.update = jest.fn().mockResolvedValue(true);
      controller.update('foo', updateGameDTO);
      expect(service.update).toHaveBeenCalledWith('foo', updateGameDTO);
    })

    it('should return exception', async () => {
      try {
        service.update = jest.fn().mockResolvedValue(false);
        await controller.update('foo', {});
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    })
  })

  describe('remove', () => {
    it('should call remove() in game.service', () => {
      service.remove = jest.fn().mockResolvedValue(true);
      controller.remove('foo');
      expect(service.remove).toHaveBeenCalledWith('foo');
    })

    it('should return exception', async () => {
      try {
        service.remove = jest.fn().mockResolvedValue(false);
        await controller.remove('foo');
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    })
  })

  describe('getPublisher', () => {
    it('should call getPublisher() in game.service', () => {
      service.getPublisher = jest.fn().mockResolvedValue({});
      controller.getPublisher('foo');
      expect(service.getPublisher).toHaveBeenCalledWith('foo');
    })

    it('should return null', async () => {
      service.getPublisher = jest.fn().mockResolvedValue(null);
      let result = await controller.getPublisher('foo');
      expect(result).toEqual(null);
    })

    it('should return exception', async () => {
      try {
        service.getPublisher = jest.fn().mockResolvedValue(false);
        await controller.getPublisher('foo');
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    })
  })

  describe('cleanGames', () => {
    it('should call cleanGames() in game.service', () => {
      service.cleanGames = jest.fn().mockResolvedValue(true);
      controller.cleanGames();
      expect(service.cleanGames).toHaveBeenCalledWith();
    })
  })
});
