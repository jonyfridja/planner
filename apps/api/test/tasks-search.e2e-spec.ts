import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/user.entity";
import { Task } from "../src/tasks/task.entity";

describe("GET /tasks search and assignee filters (e2e)", () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let taskRepo: Repository<Task>;
  let userAId: string;
  let userBId: string;
  let matchingTaskId: string;
  let otherTitleTaskId: string;
  let otherAssigneeTaskId: string;

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

    const userA = await userRepo.save(
      userRepo.create({ email: `search-test-a-${Date.now()}@example.com`, name: "Search Tester A" }),
    );
    const userB = await userRepo.save(
      userRepo.create({ email: `search-test-b-${Date.now()}@example.com`, name: "Search Tester B" }),
    );
    userAId = userA.id;
    userBId = userB.id;

    const matching = await request(server())
      .post("/api/tasks")
      .send({ title: "Order laptops for design team", taskType: "procurement", assigneeId: userAId });
    matchingTaskId = matching.body.id;

    const otherTitle = await request(server())
      .post("/api/tasks")
      .send({ title: "Unrelated request", taskType: "procurement", assigneeId: userAId });
    otherTitleTaskId = otherTitle.body.id;

    const otherAssignee = await request(server())
      .post("/api/tasks")
      .send({ title: "Order laptops for eng team", taskType: "procurement", assigneeId: userBId });
    otherAssigneeTaskId = otherAssignee.body.id;
  });

  afterAll(async () => {
    await taskRepo.delete([matchingTaskId, otherTitleTaskId, otherAssigneeTaskId]);
    await userRepo.delete([userAId, userBId]);
    await app.close();
  });

  it("filters by a case-insensitive title search", async () => {
    const res = await request(server()).get("/api/tasks").query({ search: "laptops" }).expect(200);
    const ids = res.body.map((t: { id: string }) => t.id);

    expect(ids).toEqual(expect.arrayContaining([matchingTaskId, otherAssigneeTaskId]));
    expect(ids).not.toContain(otherTitleTaskId);
  });

  it("filters by assigneeId", async () => {
    const res = await request(server()).get("/api/tasks").query({ assigneeId: userBId }).expect(200);
    const ids = res.body.map((t: { id: string }) => t.id);

    expect(ids).toEqual([otherAssigneeTaskId]);
  });

  it("combines search and assigneeId filters", async () => {
    const res = await request(server())
      .get("/api/tasks")
      .query({ search: "laptops", assigneeId: userAId })
      .expect(200);
    const ids = res.body.map((t: { id: string }) => t.id);

    expect(ids).toEqual([matchingTaskId]);
  });

  it("rejects a malformed assigneeId", async () => {
    await request(server()).get("/api/tasks").query({ assigneeId: "not-a-uuid" }).expect(400);
  });
});
