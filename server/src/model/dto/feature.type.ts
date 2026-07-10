import {IsEmail} from 'class-validator';

class GetFeatureRequest {
  @IsEmail()
  email!: string;
}

type GetFeatureResponse = {
  id: string;
  name: string;
  email: string;
};

export {GetFeatureRequest};
export type {GetFeatureResponse};
