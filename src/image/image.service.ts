import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from './entities/image.entity';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image) private imageRepository: Repository<Image>,
    private userService: UserService,
  ) {}

  async create(userId: number, createImageDto: CreateImageDto) {
    const user = await this.userService.findOne(userId);

    const image = new Image();

    image.path = createImageDto.path;
    image.user = user;

    return this.imageRepository.save(image);
  }

  findAll() {
    return `This action returns all image`;
  }

  findOne(id: number) {
    return this.imageRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.imageRepository.delete({ id });
  }
}
