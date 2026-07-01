import { AppDataSource } from "./data-source";
import { User } from "./users/user.entity";

const seedUsers = [
  { email: "alice@example.com", name: "Alice Anderson" },
  { email: "bob@example.com", name: "Bob Brown" },
  { email: "carol@example.com", name: "Carol Clarke" },
];

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  for (const data of seedUsers) {
    const existing = await userRepo.findOneBy({ email: data.email });
    if (existing) {
      console.log(`Skipping existing user ${data.email}`);
      continue;
    }
    await userRepo.save(userRepo.create(data));
    console.log(`Seeded user ${data.email}`);
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
