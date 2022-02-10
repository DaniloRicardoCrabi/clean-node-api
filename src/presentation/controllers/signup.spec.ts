import { HttpResponse } from '../protocols/http';
import { SignUpController } from './signup';
import { MissingParamError } from '../errors/missing-param-error';
import { InvalidParamError } from '../errors/invalid-param-error';
import { EmailValidator } from '../protocols/email-validator';

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}
const makeSup = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)

  return { 
          sut,
          emailValidatorStub
         }
}

describe('Signup', () => {
  test('Should return 400 if no name is provided', () => {
    const {sut} = makeSup();
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
      const {sut} = makeSup();
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
      const {sut} = makeSup();
      const httpRequest = {
        body: {
          name: 'any',
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      };
      const httpResponse: HttpResponse = sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(
        new MissingParamError('passwordConfirmation')
      );
    }),
    test('Should return 400 if no email is provided', () => {
      const {sut} = makeSup();
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

  test('Should return 400 if an invalid email is provided', () => {
    const {sut, emailValidatorStub} = makeSup();

    jest.spyOn(emailValidatorStub,'isValid').mockReturnValueOnce(false); 

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'invalid_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse: HttpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });
});
