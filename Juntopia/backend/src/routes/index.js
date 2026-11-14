import { accountModule } from "../modules/account/index.js";
import { catalogModule } from "../modules/catalog/index.js";
import { libraryModule } from "../modules/library/index.js";
import { communityModule } from "../modules/community/index.js";
import { partiesModule } from "../modules/parties/index.js";
import { creatorsModule } from "../modules/creators/index.js";
import { moderationModule } from "../modules/moderation/index.js";
export const modules = [
  accountModule,
  catalogModule,
  libraryModule,
  communityModule,
  partiesModule,
  creatorsModule,
  moderationModule,
];
export const resourceRoutes = new Map();
export const rpcRoutes = new Map();
for (const module of modules) {
  for (const [name, definition] of Object.entries(module.resources))
    resourceRoutes.set(`/api/${module.name}/${name}`, {
      resource: name,
      definition,
    });
  for (const name of module.rpcs)
    rpcRoutes.set(`/api/${module.name}/rpc/${name}`, name);
}
