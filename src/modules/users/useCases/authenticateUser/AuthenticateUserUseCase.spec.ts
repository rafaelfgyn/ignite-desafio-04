import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase'
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase 

describe('Create User', () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it('should be able to authenticate user', async () => {

    await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    const payload = await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    expect(payload).toHaveProperty('token')
  })

  it('should not authenticate a user with wrong email', async () => {

    await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    expect(async () => {

      await authenticateUserUseCase.execute({
        email: 'wrongEmail',
        password: '123'
      })

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('should not authenticate a user with wrong password', async () => {

    await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    expect(async () => {

      await authenticateUserUseCase.execute({
        email: 'emailTest',
        password: '122'
      })

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})