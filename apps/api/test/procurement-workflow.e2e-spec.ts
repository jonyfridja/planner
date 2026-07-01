import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/user.entity";
import { Task } from "../src/tasks/task.entity";

describe("Procurement task workflow (e2e)", () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let taskRepo: Repository<Task>;
  let userId: string;
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

    const user = await userRepo.save(
      userRepo.create({
        email: `workflow-test-${Date.now()}@example.com`,
        name: "Workflow Tester",
      }),
    );
    userId = user.id;
  });

  afterAll(async () => {
    if (taskId) {
      await taskRepo.delete(taskId);
    }
    await userRepo.delete(userId);
    await app.close();
  });

  it("GET /task-types exposes the procurement definition and its per-status fields", async () => {
    const res = await request(server()).get("/api/task-types").expect(200);
    const procurement = res.body.find((t: { type: string }) => t.type === "procurement");

    expect(procurement).toBeDefined();
    expect(procurement.finalStatus).toBe(3);
    expect(procurement.statuses.map((s: { value: number }) => s.value)).toEqual([1, 2, 3]);
    expect(
      procurement.statuses.find((s: { value: number }) => s.value === 2).fields.map((f: { name: string }) => f.name),
    ).toEqual(["quote1", "quote2"]);
    expect(
      procurement.statuses.find((s: { value: number }) => s.value === 3).fields.map((f: { name: string }) => f.name),
    ).toEqual(["receipt"]);
  });

  it("creates a procurement task at its initial status", async () => {
    const res = await request(server())
      .post("/api/tasks")
      .send({ title: "Buy laptops", taskType: "procurement", assigneeId: userId })
      .expect(201);

    taskId = res.body.id;
    expect(res.body.status).toBe(1);
    expect(res.body.closed).toBe(false);
    expect(res.body.userId).toBe(userId);
  });

  it("rejects skipping statuses on a forward move (1 -> 3)", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 3, assigneeId: userId })
      .expect(422);
  });

  it("rejects advancing to status 2 without the required price quotes", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: userId })
      .expect(400);
  });

  it("advances to status 2 once the required data is supplied", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({
        status: 2,
        assigneeId: userId,
        data: { quote1: "100 USD", quote2: "120 USD" },
      })
      .expect(201);

    expect(res.body.status).toBe(2);
    expect(res.body.data).toMatchObject({ quote1: "100 USD", quote2: "120 USD" });
  });

  it("allows moving backward without the forward sequential restriction", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 1, assigneeId: userId })
      .expect(201);

    expect(res.body.status).toBe(1);
  });

  it("moving forward again reuses previously stored data instead of requiring resupply", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: userId })
      .expect(201);

    expect(res.body.status).toBe(2);
    expect(res.body.data).toMatchObject({ quote1: "100 USD", quote2: "120 USD" });
  });

  it("rejects closing before the task reaches its final status", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/close`)
      .send({ assigneeId: userId })
      .expect(422);
  });

  it("advances to the final status with the receipt", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 3, assigneeId: userId, data: { receipt: "receipt-123" } })
      .expect(201);

    expect(res.body.status).toBe(3);
  });

  it("closes the task once it's at its final status", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/close`)
      .send({ assigneeId: userId })
      .expect(201);

    expect(res.body.closed).toBe(true);
  });

  it("rejects any transition on a closed (immutable) task", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: userId })
      .expect(422);
  });

  it("rejects deleting a closed task", async () => {
    await request(server()).delete(`/api/tasks/${taskId}`).expect(422);
  });

  it("reopens a closed task", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/reopen`)
      .send({ assigneeId: userId })
      .expect(201);

    expect(res.body.closed).toBe(false);
  });

  it("allows transitions again after reopening", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: userId })
      .expect(201);

    expect(res.body.status).toBe(2);
  });
});
