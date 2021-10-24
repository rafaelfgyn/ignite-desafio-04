import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import createConnection from '../../../../database/index';

let connection: Connection
let user_id: string

describe("Get statement operation", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
    const id = uuid()
    const password = await hash("admin", 8)

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
    values('${id}', 'admin', 'admin@admin.com.br','${password}' , 'now()')
    `
    )
    user_id = id
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("Should be able to create a deposit statement", async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@admin.com.br",
      password: "admin"
    })

    const { token } = responseToken.body

    const responseSatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 10,
      description: "Test"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const { id: statement_id } = responseSatement.body

    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.statusCode).toEqual(200)
    expect(response.body.type).toEqual("deposit")
  })
})
