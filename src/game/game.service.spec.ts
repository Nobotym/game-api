import { validate as uuidValidate } from 'uuid';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';
import { Publisher } from './entities/publisher.entity';

const publishersArray = [
  {name: 'Publisher 1', siret: 12345678901234, phone: '79991234567'},
  {name: 'Publisher 2', siret: 22345678901234, phone: '79992234567'},
  {name: 'Publisher 3', siret: 32345678901234, phone: '79993234567'},
];

const gamesArray = [
  {title: 'The Best Game Ever', price: 10.10, publisherId: '', tags: ['bestseller', 'RPG'], releaseDate: '2020-01-01'},
  {title: 'The Best Game Ever 2', price: 20.10, publisherId: '', tags: ['discount', 'MOBA'], releaseDate: '2020-06-02'},
  {title: 'The Best Game Ever 3', price: 30.10, publisherId: '', tags: ['RTS'], releaseDate: '2021-01-03'},
  {title: 'The Best Game Ever 1', price: 11.10, publisherId: '', tags: ['ARPG'], releaseDate: '2020-02-01'},
]

describe('GameService', () => {
  let service: GameService;
  let gameRepo: Repository<Game>;
  let publisherRepo: Repository<Publisher>;
  let publishers: Publisher[];
  let createdGameIds: string[] = [];

  beforeAll(async () => {
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
      providers: [
        GameService,
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    gameRepo = module.get<Repository<Game>>(getRepositoryToken(Game));
    publisherRepo = module.get<Repository<Publisher>>(getRepositoryToken(Publisher));

    publishers = await publisherRepo.save(
      publisherRepo.create(publishersArray)
    );

    gamesArray[0].publisherId = publishers[0].id
    gamesArray[1].publisherId = publishers[1].id
    gamesArray[2].publisherId = publishers[2].id
    gamesArray[3].publisherId = publishers[1].id
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should add a new game', async () => {
      const newGame = await service.create(gamesArray[0]);
      const expected = Object.assign(new Game(), gamesArray[0], {
        id: newGame.id,
        publisher: publishers[0]
      });
      createdGameIds.push(newGame.id);
      delete expected.publisherId;
      expect(uuidValidate(newGame.id)).toEqual(true);
      expect(newGame).toEqual(expected);
    });

    it('should return null for publisher when publisherId is not valid', async () => {
      const newGame = await service.create(
        Object.assign(
          new Game(),
          gamesArray[0], {
            publisherId: 'foo'
          }
        )
      );
      const expected = Object.assign(new Game(), gamesArray[0], {
        id: newGame.id,
        publisher: null
      });
      delete expected.publisherId;
      expect(uuidValidate(newGame.id)).toEqual(true);
      expect(newGame).toEqual(expected);
      await service.remove(newGame.id);
    });
  })

  describe('findAll', () => {
    it('should return all games', async () => {
      await service.create(gamesArray[1])
      await service.create(gamesArray[2])

      const games = await service.findAll();
      expect(games.length).toEqual(3);

      for (let i = 0; i < games.length; i++) {
        const expected = Object.assign(new Game(), gamesArray[i], {
          id: games[i].id,
          publisher: publishers[i]
        });
        delete expected.publisherId;

        if (i > 0)
          createdGameIds.push(games[i].id);
        
        expect(games[i]).toEqual(expected);
      }
    });
  })

  describe('findOne', () => {
    it('should return the game', async () => {
      const savedGame = await service.findOne(createdGameIds[0]);
      const expected = Object.assign(new Game(), gamesArray[0], {
        id: savedGame.id,
        publisher: publishers[0]
      });
      delete expected.publisherId;
      expect(savedGame).toEqual(expected);
    });

    it('should return undefined when id is not valid', async () => {
      const savedGame = await service.findOne('foo');
      expect(savedGame).toEqual(undefined);
    });
  })

  describe('update', () => {
    it('should update the game', async () => {
      const result = await service.update(createdGameIds[0], gamesArray[3]);
      const updatedGame = await service.findOne(createdGameIds[0]);
      const expected = Object.assign(new Game(), gamesArray[3], {
        id: createdGameIds[0],
        publisher: publishers[1]
      });
      delete expected.publisherId;
      expect(result).toEqual(true);
      expect(updatedGame).toEqual(expected);
    });

    it('should return false when id is not valid', async () => {
      const updatedGame = await service.update('foo', gamesArray[3]);
      expect(updatedGame).toEqual(false);
    });

    it('should return null for publisher when publisherId is not valid', async () => {
      const result = await service.update(createdGameIds[0], 
        Object.assign(
          new Game(),
          gamesArray[3], {
            publisherId: 'foo'
          }
        )
      );
      const updatedGame = await service.findOne(createdGameIds[0]);
      const expected = Object.assign(new Game(), gamesArray[3], {
        id: createdGameIds[0],
        publisher: null
      });
      delete expected.publisherId;
      expect(result).toEqual(true);
      expect(updatedGame).toEqual(expected);
    });
  })

  describe('remove', () => {
    it('should remove the game', async () => {
      const result = await service.remove(createdGameIds[0]);
      const removedGame = await service.findOne(createdGameIds[0]);
      expect(result).toEqual(true);
      expect(removedGame).toEqual(undefined);
    });

    it('should return false when id is not valid', async () => {
      const result = await service.remove(createdGameIds[0]);
      expect(result).toEqual(false);
    });
  })

  describe('getPublisher', () => {
    it('should return the publisher of the game', async () => {
      const publisher = await service.getPublisher(createdGameIds[1])
      expect(publisher).toEqual(publishers[1]);
    });

    it('should return false when id is not valid', async () => {
      const result = await service.getPublisher('foo');
      expect(result).toEqual(false);
    });
  })

  describe('cleanGames', () => {
    it('should remove games with release date >18 months and set discount \
        if release date between 12 and 18 months', async () => {
      await service.create(gamesArray[0])
      const cleanResult = await service.cleanGames();
      expect(cleanResult).toEqual(true);

      const games = await service.findAll();
      expect(games.length).toEqual(2);
      expect(games[0].price).toEqual(gamesArray[1].price * 0.8);
      expect(games[1].price).toEqual(gamesArray[2].price);
    });
  })
});
