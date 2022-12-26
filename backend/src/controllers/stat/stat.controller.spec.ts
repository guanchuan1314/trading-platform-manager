import { Test, TestingModule } from '@nestjs/testing';
import { StatController } from './stat.controller';

describe('StatController', () => {
  let controller: StatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatController],
    }).compile();

    controller = module.get<StatController>(StatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
