import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent) private parentRepository: Repository<Parent>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createParentDto: CreateParentDto) {
    const user = await this.userRepository.findOneByOrFail({
      id: createParentDto.userId,
    });

    if (!user) {
      throw new NotFoundException(
        'User with ID ' + createParentDto.userId + ' not found!',
      );
    }

    const newParent = new Parent();
    newParent.fullName = createParentDto.fullName;
    newParent.age = createParentDto.age;
    newParent.role = createParentDto.role;
    newParent.user = user;
    return this.parentRepository.save(newParent);
  }

  findAll() {
    return `This action returns all parent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parent`;
  }

  update(id: number, updateParentDto: UpdateParentDto) {
    return `This action updates a #${id} parent`;
  }

  remove(id: number) {
    return `This action removes a #${id} parent`;
  }
}
