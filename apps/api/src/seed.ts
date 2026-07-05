import type { Role } from "@planner/shared";
import { AppDataSource } from "./data-source";
import { User } from "./users/user.entity";
import { Task } from "./tasks/task.entity";

const seedUsers: { email: string; name: string; roles: Role[] }[] = [
  { email: "alice@example.com", name: "Alice Anderson", roles: ["requester"] },
  { email: "bob@example.com", name: "Bob Brown", roles: ["buyer"] },
  { email: "carol@example.com", name: "Carol Clarke", roles: ["finance"] },
  { email: "dave@example.com", name: "Dave Diaz", roles: ["buyer", "finance"] },
  { email: "erin@example.com", name: "Erin Evans", roles: ["requester", "buyer"] },
];

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const taskRepo = AppDataSource.getRepository(Task);

  const usersByEmail = new Map<string, User>();
  for (const data of seedUsers) {
    let user = await userRepo.findOneBy({ email: data.email });
    if (user) {
      console.log(`Skipping existing user ${data.email}`);
    } else {
      user = await userRepo.save(userRepo.create(data));
      console.log(`Seeded user ${data.email}`);
    }
    usersByEmail.set(data.email, user);
  }

  const seedTasks = [
    {
      title: "Buy laptops",
      taskType: "procurement",
      status: 1,
      closed: false,
      data: {},
      assigneeEmail: "alice@example.com",
    },
    {
      title: "Purchase office chairs",
      taskType: "procurement",
      status: 2,
      closed: false,
      data: { quote1: "450 USD", quote2: "480 USD" },
      assigneeEmail: "bob@example.com",
    },
    {
      title: "Buy monitors",
      taskType: "procurement",
      status: 3,
      closed: false,
      data: { quote1: "900 USD", quote2: "950 USD", receipt: "receipt-monitors-001" },
      assigneeEmail: "carol@example.com",
    },
  ];

  for (const data of seedTasks) {
    const existing = await taskRepo.findOneBy({ title: data.title });
    if (existing) {
      console.log(`Skipping existing task ${data.title}`);
      continue;
    }
    const assignee = usersByEmail.get(data.assigneeEmail)!;
    await taskRepo.save(
      taskRepo.create({
        title: data.title,
        taskType: data.taskType,
        status: data.status,
        closed: data.closed,
        data: data.data,
        userId: assignee.id,
      }),
    );
    console.log(`Seeded task ${data.title}`);
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
