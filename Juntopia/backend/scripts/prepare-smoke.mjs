import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
const users = Array.from({ length: 3 }, () => ({
  id: randomUUID(),
  email: `smoke-${randomUUID()}@example.invalid`,
  password: randomBytes(24).toString("hex"),
}));
mkdirSync(".test-runtime", { recursive: true });
writeFileSync(".test-runtime/fixtures.json", JSON.stringify(users));
const sql = users
  .map(
    (u) =>
      `insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change,email_change_token_new,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values('00000000-0000-0000-0000-000000000000','${u.id}','authenticated','authenticated','${u.email}',extensions.crypt('${u.password}',extensions.gen_salt('bf')),now(),'','','','','{"provider":"email","providers":["email"]}','{}',now(),now());\ninsert into auth.identities(id,user_id,provider_id,identity_data,provider,created_at,updated_at) values(gen_random_uuid(),'${u.id}','${u.id}','{"sub":"${u.id}","email":"${u.email}","email_verified":true}','email',now(),now());`,
  )
  .join("\n");
writeFileSync(".test-runtime/setup.sql", sql);
writeFileSync(
  ".test-runtime/cleanup.sql",
  `delete from auth.users where id in (${users.map((u) => `'${u.id}'`).join(",")});`,
);
console.log("Fixtures descartables preparadas; ninguna contraseña se imprime.");
