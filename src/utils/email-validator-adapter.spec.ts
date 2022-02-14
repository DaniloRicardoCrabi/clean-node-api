import { EmailValidatorAdapter } from './email-validator'

describe('EmailValidator Adapter', () => {
    test('Should return false is validator returns false', () => {
        const sut = new EmailValidatorAdapter()
       const isValid =  sut.isValid('invalid_email@gmail.com')
       expect(isValid).toBe(false)
    })
})