import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const game = await this.gameService.findOne(id);
    if (!game)
      throw new NotFoundException();

    return game;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const result = await this.gameService.update(id, updateGameDto);
    if (!result)
      throw new NotFoundException();

    return {updated: result}
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.gameService.remove(id);
    if (!result)
      throw new NotFoundException();

    return {deleted: result}
  }

  @Get(':id/publisher')
  async getPublisher(@Param('id') id: string) {
    const publisher = await this.gameService.getPublisher(id);
    if (publisher === false)
      throw new NotFoundException();

    return publisher;
  }

  @Patch()
  async cleanGames() {
    await this.gameService.cleanGames()

    return {cleaned: true}
  }
}
