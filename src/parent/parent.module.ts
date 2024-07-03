import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Parent } from './entities/parent.entity';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';

@Module({
  imports: [TypeOrmModule.forFeature([Parent]), UserModule],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
