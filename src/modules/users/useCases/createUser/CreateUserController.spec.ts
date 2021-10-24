import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from "typeorm";
import { convertToObject } from 'typescript';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import createConnection from '../../../../database/index';
import { CreateStatementError } from '../../../statements/useCases/createStatement/CreateStatementError';
import { CreateUserError } from './CreateUserError';

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

  it("Should be able to create a an user", async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: "admin1",
      email: "admin1@admin.com.br",
      password: "admin"
    })

    expect(response.statusCode).toEqual(201)
  })

  it("Should not be able to create an user with already exiting email", async () => {
      await request(app).post('/api/v1/users').send({
        name: "admin",
        email: "admin@admin.com.br",
        password: "admin"
      })

      const response = await request(app).post('/api/v1/users').send({
        name: "admin",
        email: "admin@admin.com.br",
        password: "admin"
      })

      expect(response.statusCode).toBe(400)
  })
})
