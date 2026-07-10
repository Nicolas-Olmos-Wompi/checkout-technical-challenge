import {IresponseCode} from '../../model/interfaces/response-code.interface';

type TGeneralErrors = 'GeneralException';
type TBusinessError = 'BusinessException';

export const ERROR_STATES_MESSAGES: Record<
  TGeneralErrors | TBusinessError,
  IresponseCode
> = {
  GeneralException: {
    code: 'EXC_001',
    message: 'Se presentó error interno procesando la solicitud.',
  },
  BusinessException: {
    code: 'EXC_002',
    message: 'Se presentó error de negocio procesando la solicitud.',
  },
};
