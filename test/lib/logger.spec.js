const stdMocks = require('std-mocks');
const sinon = require('sinon');
const logger = require('../../src/lib/logger');

describe('Logger test', () => {
  let brokenClock;
  before(() => {
    process.env.APP_NAME = 'application-name';
    stdMocks.use({ print: true });
    brokenClock = sinon.useFakeTimers(new Date('2018-06-05T18:20:42.345Z').getTime());
  });

  beforeEach(() => {
    stdMocks.flush();
  });

  after(() => {
    delete process.env.APP_NAME;
    stdMocks.restore();
    brokenClock.restore();
  });

  describe('Logstash format', () => {
    it('should log empty message fields when message is not provided', () => {
      logger.info();
      const expectedOutput = {
        '@timestamp': '2018-06-05T18:20:42.345Z',
        '@version': 1,
        application: 'application-name',
        message: '',
        level: 'INFO',
      };

      const actualOutput = stdMocks.flush().stdout[0];
      JSON.parse(actualOutput).should.be.deep.equal(expectedOutput);
    });

    it('should log @timestamp, application, message and level fields', () => {
      logger.info('some message');
      const expectedOutput = {
        '@timestamp': '2018-06-05T18:20:42.345Z',
        '@version': 1,
        application: 'application-name',
        message: 'some message',
        level: 'INFO',
      };

      const actualOutput = stdMocks.flush().stdout[0];
      JSON.parse(actualOutput).should.be.deep.equal(expectedOutput);
    });

    it('should log @timestamp, application, message, level and environment fields', () => {
      process.env.NODE_ENV = 'test';
      logger.info('some message');
      delete process.env.NODE_ENV;
      const expectedOutput = {
        '@timestamp': '2018-06-05T18:20:42.345Z',
        '@version': 1,
        application: 'application-name',
        message: 'some message',
        level: 'INFO',
        environment: 'test',
      };

      const actualOutput = stdMocks.flush().stdout[0];
      JSON.parse(actualOutput).should.be.deep.equal(expectedOutput);
    });

    it('should log @timestamp, application, message, level and host fields', () => {
      process.env.HOST = 'test.host';
      logger.info('some message');
      delete process.env.HOST;
      const expectedOutput = {
        '@timestamp': '2018-06-05T18:20:42.345Z',
        '@version': 1,
        application: 'application-name',
        message: 'some message',
        level: 'INFO',
        host: 'test.host',
      };

      const actualOutput = stdMocks.flush().stdout[0];
      JSON.parse(actualOutput).should.be.deep.equal(expectedOutput);
    });

    it('should log @timestamp, application, message, level and stack_trace fields', () => {
      logger.info('some message', new Error('some reason'));

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('@timestamp').and.be.equal('2018-06-05T18:20:42.345Z');
      actualOutput.should.have.property('@version').and.be.equal(1);
      actualOutput.should.have.property('application').and.be.equal('application-name');
      actualOutput.should.have.property('message').and.be.equal('some message: some reason');
      actualOutput.should.have.property('level').and.be.equal('INFO');
      actualOutput.should.have.property('stack_trace');
    });

    it('should log error message when message is not provided', () => {
      logger.info(new Error('some reason'));

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('@timestamp').and.be.equal('2018-06-05T18:20:42.345Z');
      actualOutput.should.have.property('@version').and.be.equal(1);
      actualOutput.should.have.property('application').and.be.equal('application-name');
      actualOutput.should.have.property('message').and.be.equal('some reason');
      actualOutput.should.have.property('level').and.be.equal('INFO');
      actualOutput.should.have.property('stack_trace');
    });

    it('should log required and extra fields', () => {
      logger.info('some message', { some: 'extra field', another: 'field' });
      const expectedOutput = {
        '@timestamp': '2018-06-05T18:20:42.345Z',
        '@version': 1,
        application: 'application-name',
        message: 'some message',
        level: 'INFO',
        some: 'extra field',
        another: 'field',
      };

      const actualOutput = stdMocks.flush().stdout[0];
      JSON.parse(actualOutput).should.be.deep.equal(expectedOutput);
    });
  });

  describe('Log level', () => {
    it('should log as FATAL level', () => {
      logger.fatal('some message');
      const actualOutput = JSON.parse(stdMocks.flush().stderr[0]);
      actualOutput.should.have.property('level').and.be.equal('FATAL');
    });

    it('should log as ERROR level', () => {
      logger.error('some message');

      const actualOutput = JSON.parse(stdMocks.flush().stderr[0]);
      actualOutput.should.have.property('level').and.be.equal('ERROR');
    });

    it('should log as WARN level', () => {
      logger.warn('some message');

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('level').and.be.equal('WARN');
    });

    it('should log as INFO level', () => {
      logger.info('some message');

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('level').and.be.equal('INFO');
    });

    it('should log as DEBUG level', () => {
      logger.debug('some message');

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('level').and.be.equal('DEBUG');
    });

    it('should log as DEBUG level when was call with verbose method', () => {
      logger.verbose('some message');

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('level').and.be.equal('DEBUG');
    });

    it('should log as DEBUG level when was call with silly method', () => {
      logger.silly('some message');

      const actualOutput = JSON.parse(stdMocks.flush().stdout[0]);
      actualOutput.should.have.property('level').and.be.equal('DEBUG');
    });
  });
});