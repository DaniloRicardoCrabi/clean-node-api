import { HttpResponse, EmailValidator } from '../protocols';
import { SignUpController } from './signup';
import { MissingParamError, InvalidParamError, ServerError } from '../errors';

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
        return true
    }
  }
  return new EmailValidatorStub()
} 

const makeEmailValidatorWithError = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
        throw new Error()
    }
  }
  return new EmailValidatorStub()
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

  test('Should call EmailValidator with correct email ', () => {
    const {sut, emailValidatorStub} = makeSup();

   const isValidSpy = jest.spyOn(emailValidatorStub,'isValid')

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
    
  });

  test('Should return 500 if email validate throws', () => {

    const emailValidatorStub = makeEmailValidatorWithError()
    const sut = new SignUpController(emailValidatorStub)

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse: HttpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

});
