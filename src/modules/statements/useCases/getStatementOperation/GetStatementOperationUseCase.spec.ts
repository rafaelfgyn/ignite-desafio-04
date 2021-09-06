import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase'
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase'
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';
import { CreateStatementError } from '../createStatement/CreateStatementError';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create User', () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)

    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  })

  it('should be able to get a statement', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const newStatement: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    const { id: statementId } = await createStatementUseCase.execute(newStatement)

    const getStatementOperation = await getStatementOperationUseCase.execute({user_id: id as string, statement_id: statementId as string })

    expect(getStatementOperation).toHaveProperty('id')
    expect(getStatementOperation).toHaveProperty('user_id')
  })

  it('should be able to get a statement of non existing user', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const newStatement: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    const { id: statementId } = await createStatementUseCase.execute(newStatement)

    expect(async () => {

      await getStatementOperationUseCase.execute({user_id: 'fakeId', statement_id: statementId as string })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)


  })

  it('should be able to get info of non existing statement', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const newStatement: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    await createStatementUseCase.execute(newStatement)

    expect(async () => {

      await getStatementOperationUseCase.execute({user_id: id as string, statement_id: 'fakeId' })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})