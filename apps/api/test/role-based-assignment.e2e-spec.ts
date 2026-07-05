import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/user.entity";
import { Task } from "../src/tasks/task.entity";

describe("Role-based assignment (e2e)", () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let taskRepo: Repository<Task>;
  let requesterId: string;
  let buyerId: string;
  let taskId: string;

  const server = () => app.getHttpServer();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userRepo = moduleRef.get(getRepositoryToken(User));
    taskRepo = moduleRef.get(getRepositoryToken(Task));

    const requester = await userRepo.save(
      userRepo.create({
        email: `role-test-requester-${Date.now()}@example.com`,
        name: "Role Test Requester",
        roles: ["requester"],
      }),
    );
    requesterId = requester.id;

    const buyer = await userRepo.save(
      userRepo.create({
        email: `role-test-buyer-${Date.now()}@example.com`,
        name: "Role Test Buyer",
        roles: ["buyer"],
      }),
    );
    buyerId = buyer.id;
  });

  afterAll(async () => {
    if (taskId) {
      await taskRepo.delete(taskId);
    }
    await userRepo.delete(requesterId);
    await userRepo.delete(buyerId);
    await app.close();
  });

  it("rejects creating a task with an assignee who lacks the initial status's required role", async () => {
    await request(server())
      .post("/api/tasks")
      .send({ title: "Buy servers", taskType: "procurement", assigneeId: buyerId })
      .expect(422);
  });

  it("creates the task once assigned to a user with the required role", async () => {
    const res = await request(server())
      .post("/api/tasks")
      .send({ title: "Buy servers", taskType: "procurement", assigneeId: requesterId })
      .expect(201);

    taskId = res.body.id;
    expect(res.body.status).toBe(1);
  });

  it("rejects advancing to a status whose required role the assignee lacks", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({
        status: 2,
        assigneeId: requesterId,
        data: { quote1: "100 USD", quote2: "120 USD" },
      })
      .expect(422);
  });

  it("advances once assigned to a user holding the required role", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({
        status: 2,
        assigneeId: buyerId,
        data: { quote1: "100 USD", quote2: "120 USD" },
      })
      .expect(201);

    expect(res.body.status).toBe(2);
    expect(res.body.userId).toBe(buyerId);
  });
});
