import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/user.entity";
import { Task } from "../src/tasks/task.entity";

describe("Development task workflow (e2e)", () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let taskRepo: Repository<Task>;
  let requesterId: string;
  let analystId: string;
  let developerId: string;
  let publisherId: string;
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

    const suffix = Date.now();
    const requester = await userRepo.save(
      userRepo.create({ email: `dev-test-requester-${suffix}@example.com`, name: "Dev Test Requester", roles: ["requester"] }),
    );
    requesterId = requester.id;

    const analyst = await userRepo.save(
      userRepo.create({ email: `dev-test-analyst-${suffix}@example.com`, name: "Dev Test Analyst", roles: ["analyst"] }),
    );
    analystId = analyst.id;

    const developer = await userRepo.save(
      userRepo.create({ email: `dev-test-developer-${suffix}@example.com`, name: "Dev Test Developer", roles: ["developer"] }),
    );
    developerId = developer.id;

    const publisher = await userRepo.save(
      userRepo.create({ email: `dev-test-publisher-${suffix}@example.com`, name: "Dev Test Publisher", roles: ["publisher"] }),
    );
    publisherId = publisher.id;
  });

  afterAll(async () => {
    if (taskId) {
      await taskRepo.delete(taskId);
    }
    await userRepo.delete([requesterId, analystId, developerId, publisherId]);
    await app.close();
  });

  it("GET /task-types exposes the development definition and its per-status fields", async () => {
    const res = await request(server()).get("/api/task-types").expect(200);
    const development = res.body.find((t: { type: string }) => t.type === "development");

    expect(development).toBeDefined();
    expect(development.finalStatus).toBe(4);
    expect(development.statuses.map((s: { value: number }) => s.value)).toEqual([1, 2, 3, 4]);
    expect(
      development.statuses.find((s: { value: number }) => s.value === 2).fields.map((f: { name: string }) => f.name),
    ).toEqual(["specification"]);
    expect(
      development.statuses.find((s: { value: number }) => s.value === 3).fields.map((f: { name: string }) => f.name),
    ).toEqual(["branchName"]);
    expect(
      development.statuses.find((s: { value: number }) => s.value === 4).fields.map((f: { name: string }) => f.name),
    ).toEqual(["version"]);
  });

  it("creates a development task at its initial status", async () => {
    const res = await request(server())
      .post("/api/tasks")
      .send({ title: "Rebuild checkout flow", taskType: "development", assigneeId: requesterId })
      .expect(201);

    taskId = res.body.id;
    expect(res.body.status).toBe(1);
  });

  it("rejects advancing to specification-completed without the required text", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: analystId })
      .expect(400);
  });

  it("rejects advancing when the assignee lacks the required role for the step", async () => {
    await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: requesterId, data: { specification: "Support guest checkout" } })
      .expect(422);
  });

  it("advances through specification, development, and distribution with the right roles", async () => {
    let res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 2, assigneeId: analystId, data: { specification: "Support guest checkout" } })
      .expect(201);
    expect(res.body.status).toBe(2);

    res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 3, assigneeId: developerId, data: { branchName: "feature/guest-checkout" } })
      .expect(201);
    expect(res.body.status).toBe(3);

    res = await request(server())
      .post(`/api/tasks/${taskId}/transition`)
      .send({ status: 4, assigneeId: publisherId, data: { version: "2.4.0" } })
      .expect(201);
    expect(res.body.status).toBe(4);
  });

  it("closes the task once it's at its final status", async () => {
    const res = await request(server())
      .post(`/api/tasks/${taskId}/close`)
      .send({ assigneeId: publisherId })
      .expect(201);

    expect(res.body.closed).toBe(true);
  });
});
