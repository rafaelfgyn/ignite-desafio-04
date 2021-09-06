import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getBalanceUseCase: GetBalanceUseCase
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('', () => {

  beforeEach(() => {

    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  })

  it('should be able to get balance of the user', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    const statement: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    await createStatementUseCase.execute(statement)

    const balance = await getBalanceUseCase.execute({ user_id: id as string })

    expect(balance).toHaveProperty('balance')
  })

  it('should be able to get balance of non existing user', async () => {

    const { id } = await createUserUseCase.execute({
      name: 'nameTest',
      email: 'emailTest',
      password: '123'
    })

    const statement: ICreateStatementDTO = {
      user_id: id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Um exemplo',
    }

    await createStatementUseCase.execute(statement)

    expect(async () => {

      await getBalanceUseCase.execute({ user_id: 'fakeId' })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})