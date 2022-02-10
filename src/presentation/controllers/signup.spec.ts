import { HttpResponse } from '../protocols/http';
import { SignUpController } from './signup';
import { MissingParamError } from '../errors/missing-param-error';

const makeSup = (): SignUpController => {
  return new SignUpController()
}


describe('Signup', () => {

  test('Should return 400 if no name is provided', () => {
    const sut = makeSup()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  }),

    test('Should return 400 if no password is provided', () => {
      const sut = new SignUpController();
      const httpRequest = {
        body: {
          name: 'any',
          email: 'any_email@mail.com',
          passwordConfirmation: 'any_password'
        }
      };
      const httpResponse: HttpResponse = sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError('password'));
    }),

    test('Should return 400 if no passwordConfirmation is provided', () => {
      const sut = new SignUpController();
      const httpRequest = {
        body: {
          name: 'any',
          email: 'any_email@mail.com',
          password: 'any_password',
        }
      };
      const httpResponse: HttpResponse = sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'));
    }),

    test('Should return 400 if no email is provided', () => {
      const sut = new SignUpController();
      const httpRequest = {
        body: {
          name: 'any',
          password: 'any_password',
          passwordConfirmation: 'any_password'
        }
      };
      const httpResponse: HttpResponse = sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError('email'));
    });

});
