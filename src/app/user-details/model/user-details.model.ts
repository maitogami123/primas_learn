import { Parent } from 'src/app/parent-card/parent.model';

export interface UserDetail {
  id: number;
  fullName: string;
  socialId: string;
  fixedAddress: string;
  address: string;
  parents: Parent[];
  images: { id: string; path: string }[];
}
