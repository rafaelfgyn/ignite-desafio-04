import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {

  beforeEach(() => {

    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it('it should be able to create a new user', async () => {

    const user = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    expect(user).toHaveProperty('id')
  })

  it('it should be able to create a new user with existing email', async () => {

    await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    expect(async () => {

      await createUserUseCase.execute({
        name: 'nameTest1',
        email: 'emailTest',
        password: '123'
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})