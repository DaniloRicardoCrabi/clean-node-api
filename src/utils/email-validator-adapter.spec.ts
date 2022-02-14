import { EmailValidatorAdapter } from './email-validator'
import validator from 'validator'

jest.mock('validator', () => ({
    isEmail (): boolean {
        return true
    } 
}))

describe('EmailValidator Adapter', () => {
    test('Should return false is validator returns false', () => {
        const sut = new EmailValidatorAdapter()
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
       const isValid =  sut.isValid('invalid_emailgmail.com')
       expect(isValid).toBe(false)
    })

    test('Should return false is validator returns false', () => {
        const sut = new EmailValidatorAdapter()
       const isValid =  sut.isValid('valid_email@gmail.com')
       expect(isValid).toBe(true)
    })
})