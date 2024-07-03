import { Parent } from '../parent-card/parent.model';

export interface User {
  id: number;
  fullName: string;
  socialId: string;
  fixedAddress: string;
  address: string;
}
