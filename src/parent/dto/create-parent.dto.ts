import { Role } from 'src/enums';

export class CreateParentDto {
  userId: number;

  fullName: string;

  age: number;

  role: Role;
}
