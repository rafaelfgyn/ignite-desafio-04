import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase'
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { CreateStatementUseCase } from './CreateStatementUseCase'
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { CreateStatementError } from './CreateStatementError';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase 

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
  })

  it('should be able to create a deposit statement', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const statement: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    const createdStatement = await createStatementUseCase.execute(statement)

    expect(createdStatement).toHaveProperty('id')
  })

  it('should be able to create withdraw statement', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const statementDeposit: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    const statementWithdraw: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'Um exemplo',
    }

    await createStatementUseCase.execute(statementDeposit)
    const createdStatementWithdraw = await createStatementUseCase.execute(statementWithdraw)

    expect(createdStatementWithdraw).toHaveProperty('id')
  })

  it('should not create a statement with a non existing user', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const statement: ICreateStatementDTO = {
      user_id: "fakeId",
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    expect(async () => {

      await createStatementUseCase.execute(statement)

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should not create a statement if withdraw > balance', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    await authenticateUserUseCase.execute({
      email: 'emailTest',
      password: '123'
    })

    const statementDeposit: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    await createStatementUseCase.execute(statementDeposit)

    const statementWithdraw: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.WITHDRAW,
      amount: 150,
      description: 'Um exemplo',
    }
    
    expect(async () => {

      await createStatementUseCase.execute(statementWithdraw)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})