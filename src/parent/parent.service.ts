import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { Parent } from './entities/parent.entity';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent) private parentRepository: Repository<Parent>,
    private userService: UserService,
  ) {}

  async create(createParentDto: CreateParentDto) {
    const user = await this.userService.findOne(createParentDto.userId);

    const newParent = new Parent();
    newParent.fullName = createParentDto.fullName;
    newParent.age = createParentDto.age;
    newParent.role = createParentDto.role;
    newParent.user = user;
    return this.parentRepository.save(newParent);
  }

  findOne(id: number) {
    return this.parentRepository.findOneBy({ id });
  }

  async update(id: number, updateParentDto: UpdateParentDto) {
    return (await this.parentRepository.update({ id }, { ...updateParentDto }))
      .raw[0];
  }

  remove(id: number) {
    return this.parentRepository.delete(id);
  }
}
