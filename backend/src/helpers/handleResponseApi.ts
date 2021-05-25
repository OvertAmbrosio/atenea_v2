import { tipoStatus, TRespuesta } from 'src/api/common/apiResponse';
import { Logger } from 'winston';

export function handleError(logger:Logger, service:string, error:any): TRespuesta {
  logger.error({ message: error.message?error.message:error, service });
  return({
    status: tipoStatus.ERROR,
    message: error.message?error.message:'Error en el servicio.',
    data: null
  });
};