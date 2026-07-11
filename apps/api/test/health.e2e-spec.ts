import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Health check (e2e)", () => {
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

  it("GET /health reports the database as up", async () => {
    const res = await request(server()).get("/api/health").expect(200);

    expect(res.body).toMatchObject({
      status: "ok",
      info: { database: { status: "up" } },
      details: { database: { status: "up" } },
    });
  });
});
