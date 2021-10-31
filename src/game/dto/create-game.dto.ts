import { Publisher } from "../entities/publisher.entity";

export class CreateGameDto {
  title: string;
  price: number;
  publisherId: string;
  tags: string[];
  releaseDate: string;
  publisher?: Publisher;
}
