import generalConfig from './general.config';

describe('GeneralConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {...ORIGINAL_ENV};
  });

  it('should return the port in process.env.PORT', () => {
    process.env.PORT = '8000';
    const general = generalConfig();

    expect(general.version).toBe(process.env.PORT);
  });

  it('should return the default port', () => {
    const general = generalConfig();

    expect(general.version).toBe('3001');
  });
});
