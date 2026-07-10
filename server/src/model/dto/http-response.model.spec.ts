import {HTTPResponse} from './http-response.model';

describe('HTTPResponse', () => {
  it('should initialize a 404 error', () => {
    const status = 404;
    const error = {
      code: 'EXC_test',
      message: 'dummy-error-message',
    };

    const result = new HTTPResponse(status, error.code, error.message);

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('meta');
    expect(result).toHaveProperty('status', status);
    expect(result).toHaveProperty('code', error.code);
    expect(result).toHaveProperty('message', error.message);
  });
});
