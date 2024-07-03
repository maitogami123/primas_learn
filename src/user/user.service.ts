import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = new User();
    user.fullName = createUserDto.fullName;
    user.socialId = createUserDto.socialId;
    user.address = createUserDto.address;
    user.fixedAddress = createUserDto.fixedAddress;
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { parents: true },
    });
    console.log(user);
    if (!user) {
      throw new NotFoundException(`User with Id ${id} not found!`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return (await this.userRepository.update({ id }, { ...updateUserDto }))
      .raw[0];
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
