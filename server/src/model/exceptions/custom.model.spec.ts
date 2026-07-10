import {CustomException} from './custom.model';

describe('CustomException', () => {
  const customException = CustomException;

  it('should initialize a custom error with all params', () => {
    const context = {
      name: 'dummy-context',
      message: 'dummy-message',
      stack: 'dummy-stack',
    };
    const type = 'Technical';
    const error = {
      code: 'EXC_test',
      message: 'dummy-error-message',
    };
    const details = 'dummy-deatils';

    const result = new customException(context, type, error, details);

    expect(result).toHaveProperty('context', context);
    expect(result).toHaveProperty('type', type);
    expect(result).toHaveProperty('code', error.code);
    expect(result).toHaveProperty('message', error.message);
    expect(result).toHaveProperty('details', details);
  });

  it('should initialize a custom error with necessary params', () => {
    const context = {
      name: 'dummy-context',
      message: 'dummy-message',
      stack: 'dummy-stack',
    };

    const result = new customException(context);

    expect(result).toHaveProperty('context', context);
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('details');
  });
});
