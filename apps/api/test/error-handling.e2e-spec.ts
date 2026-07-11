import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Global exception filter (e2e)", () => {
  let app: INestApplication;

  const server = () => app.getHttpServer();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("passes through a thrown HttpException's status and body unchanged", async () => {
    const res = await request(server())
      .get("/api/tasks/00000000-0000-0000-0000-000000000000")
      .expect(404);

    expect(res.body.message).toBe("Task 00000000-0000-0000-0000-000000000000 not found");
  });

  it("catches an unexpected (non-HttpException) error and returns a generic 500 without leaking internals", async () => {
    const res = await request(server()).get("/api/tasks/not-a-uuid").expect(500);

    expect(res.body).toEqual({ statusCode: 500, message: "Internal server error" });
  });
});
