import { HttpResponse } from '../protocols/http'
import { SignUpController } from './signup'
import {MissingParamError} from '../errors/missing-param-error'

describe('Signup', () => {
    test('Should return 400 if no name is provided', () => {
        const sut = new SignUpController()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: "any_password",
                passwordConfirmation: "any_password"
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))
    }),
    test('Should return 400 if no email is provided', () => {
        const sut = new SignUpController()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: "any_password",
                passwordConfirmation: "any_password"
            }
        }
        const httpResponse: HttpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })
})