import { Test, TestingModule } from '@nestjs/testing';
import { ThingsBoardController } from './things-board.controller';
import { ThingsBoardService } from './things-board.service';

describe('ThingsBoardController', () => {
  let thingsBoardController: ThingsBoardController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ThingsBoardController],
      providers: [ThingsBoardService],
    }).compile();

    thingsBoardController = app.get<ThingsBoardController>(ThingsBoardController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(thingsBoardController.getHello()).toBe('Hello World!');
    });
  });
});
