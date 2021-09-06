import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {

  beforeEach(() => {

    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it('it should be able to get user infos', async () => {

   const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    const user = await showUserProfileUseCase.execute(id as string)

    expect(user).toHaveProperty('id')
  })

  it('should not be able to get infos of non existing user', async () => {

   await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    let id = 'invalidId'

    expect(async () => {

      await showUserProfileUseCase.execute(id)

    }).rejects.toBeInstanceOf(AppError)
  })
})