import { Statement } from "../entities/Statement";

export class BalanceMap {

  static toDTO({ statement, balance }: { statement: Statement[], balance: number }) {

    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at
    }) => (
      {
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at
      }
    ));

    let balanceResult = 0

    parsedStatement.forEach(obj => { balanceResult += obj.amount })

    return {
      statement: parsedStatement,
      balance: Number(balanceResult)
    }
  }
}
