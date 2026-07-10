import {IresponseCode} from '../../model/interfaces/response-code.interface';

type TSuccessMessage = 'Success';

export const SUCCESS_STATES_MESSAGES: Record<TSuccessMessage, IresponseCode> = {
  Success: {
    code: 'OK',
    message: 'Solicitud ejecutada correctamente.',
  },
};
