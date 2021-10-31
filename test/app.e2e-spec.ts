import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './../src/game/entities/game.entity';
import { Publisher } from './../src/game/entities/publisher.entity';
import { AppModule } from './../src/app.module';

const GameExample = {title: 'The Best Game Ever', price: 10.10, tags: ['bestseller', 'RPG'], releaseDate: '2020-01-01'};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdGameId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          name: 'test',
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [Game, Publisher],
          synchronize: true,
          autoLoadEntities: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([Game, Publisher], 'test')
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/game (POST)', async () => {
    const data = await request(app.getHttpServer())
      .post('/game')
      .send(GameExample)
      .expect(201);

    expect(data.body).toEqual({...GameExample, id: expect.any(String), publisher: null});
    createdGameId = data.body.id
  });

  it('/game (GET)', async () => {
    const data = await request(app.getHttpServer())
      .get('/game')
      .expect(200);

    expect(data.body).toEqual([{...GameExample, id: expect.any(String), publisher: null}]);
  });

  it('/game/:id (GET)', async () => {
    const data = await request(app.getHttpServer())
      .get('/game/' + createdGameId)
      .expect(200);

    expect(data.body).toEqual({...GameExample, id: expect.any(String), publisher: null});
  });

  it('/game/:id (PATCH)', async () => {
    const patchedGame = {...GameExample, price: 20, title: 'The Best Game Ever 1'}
    const data = await request(app.getHttpServer())
      .patch('/game/' + createdGameId)
      .send(patchedGame)
      .expect(200);

    expect(data.body).toEqual({updated: true});

    const updatedData = await request(app.getHttpServer())
      .get('/game/' + createdGameId)
      .expect(200);

    expect(updatedData.body).toEqual({...patchedGame, id: expect.any(String), publisher: null});
  });

  it('/game/:id (DELETE)', async () => {
    const data = await request(app.getHttpServer())
      .delete('/game/' + createdGameId)
      .expect(200);

    expect(data.body).toEqual({deleted: true});

    await request(app.getHttpServer())
      .get('/game/' + createdGameId)
      .expect(404);
  });

  it('/game/:id/publisher (GET)', async () => {
    const data = await request(app.getHttpServer())
      .post('/game')
      .send(GameExample)
      .expect(201);

    await request(app.getHttpServer())
      .get('/game/' + data.body.id + '/publisher')
      .expect(200)
      .expect({});
  });

  it('/game (PATCH)', async () => {
    await request(app.getHttpServer())
      .patch('/game')
      .expect(200)
      .expect({cleaned: true});
  });
});
