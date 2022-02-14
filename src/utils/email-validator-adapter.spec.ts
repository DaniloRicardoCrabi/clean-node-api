import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

jest.mock('validator', () => ({
    isEmail (): boolean {
        return true
    } 
}))

const makeSut = (): EmailValidatorAdapter => {
    return new EmailValidatorAdapter()
}

describe('EmailValidator Adapter', () => {
    test('Should return false is validator returns false', () => {
        const sut = makeSut()
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
       const isValid =  sut.isValid('invalid_emailgmail.com')
       expect(isValid).toBe(false)
    })

    test('Should return false is validator returns false', () => {
        const sut = makeSut()
       const isValid =  sut.isValid('valid_email@gmail.com')
       expect(isValid).toBe(true)
    })

    test('Should call validator with correct email', () => {
        const email = 'any_email@gmail.com'
        const sut = makeSut()
        const isEmailSpy = jest.spyOn(validator, 'isEmail')
       sut.isValid(email)
       expect(isEmailSpy).toHaveBeenLastCalledWith(email)
    })
})