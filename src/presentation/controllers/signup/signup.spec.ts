import {EmailValidator, AccountModel, AddAccount, AddAccountModel, HttpResponse} from './signup-protocols';
import { SignUpController } from './signup';
import { MissingParamError, InvalidParamError, ServerError } from '../../errors';



interface SutTypes {
  sut: SignUpController;
  emailValidatorStub: EmailValidator;
  addAccountStub: AddAccount;
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }
  return new EmailValidatorStub();
};

const makeAddAcccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
   async add (account: AddAccountModel): Promise<AccountModel> {
      
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password'
      }
      return new Promise(resolve => resolve(fakeAccount))
    }
  }
  return new AddAccountStub()
};

const makeSup = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator();
  const addAccountStub = makeAddAcccount();

  const sut = new SignUpController(emailValidatorStub, addAccountStub);

  return {
    sut,
    emailValidatorStub,
    addAccountStub
  };
};

describe('Signup', () => {
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSup();
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  }),
  test('Should return 400 if no password is provided', async () => {
      const { sut } = makeSup();
      const httpRequest = {
        body: {
          name: 'any',
          email: 'any_email@mail.com',
          passwordConfirmation: 'any_password'
        }
      };
      const httpResponse: HttpResponse = await sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError('password'));
    }),

  test('Should return 400 if password confirmation fails', async () => {
      const { sut } = makeSup();
      const httpRequest = {
        body: {
          name: 'any',
          email: 'any_email@mail.com',
          password: 'any_password',
          passwordConfirmation: 'invalid_password'
        }
      };
      const httpResponse: HttpResponse = await sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'));
    }),
  test('Should return 400 if no passwordConfirmation is provided', async () => {
      const { sut } = makeSup();
      const httpRequest = {
        body: {
          name: 'any',
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      };
      const httpResponse: HttpResponse = await sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(
        new MissingParamError('passwordConfirmation')
      );
    }),
  test('Should return 400 if no email is provided', async () => {
      const { sut } = makeSup();
      const httpRequest = {
        body: {
          name: 'any',
          password: 'any_password',
          passwordConfirmation: 'any_password'
        }
      };
      const httpResponse: HttpResponse = await sut.handle(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError('email'));
    });

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSup();

    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'invalid_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse: HttpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });

  test('Should call EmailValidator with correct email ', async () => {
    const { sut, emailValidatorStub } = makeSup();

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    await sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com');
  });

  test('Should return 500 if email validate throws', async () => {
    const { sut, emailValidatorStub } = makeSup();

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse: HttpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSup()
    const addSpy = jest.spyOn(addAccountStub,'add')
    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    await sut.handle(httpRequest);
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any',
      password: 'any_password',
      email: 'any_email@mail.com',
    })

  });
  test('Should return 500 if addAccount throws', async () => {
    const { sut, addAccountStub} = makeSup();

    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()))
       })

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse: HttpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });
  test('Should return 200 if addAccount sucessfully', async () => {
    const { sut } = makeSup();

    const httpRequest = {
      body: {
        name: 'any',
        password: 'any_password',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse: HttpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    });
  });
});
