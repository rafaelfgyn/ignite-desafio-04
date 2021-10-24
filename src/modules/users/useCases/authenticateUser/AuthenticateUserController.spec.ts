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

  it("Should be able to authenticate an user", async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "admin@admin.com.br",
      password: "admin"
    })

    expect(response.statusCode).toEqual(200)
  })

  it("Should not be able to authenticate an user with wrong password", async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "admin@admin.com.br",
      password: "adminn"
    })

    expect(response.statusCode).toEqual(401)
  })

  it("Should not be able to authenticate an user with wrong email", async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "admin@adminn.com.br",
      password: "admin"
    })

    expect(response.statusCode).toEqual(401)
  })
})
