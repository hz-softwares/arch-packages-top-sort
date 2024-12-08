import Elysia from "elysia";
import { getPackageDependencyTopSort } from "../domain/packageResolver";

export function dependencyResolver(app: Elysia) {
	app.get("/", async (req) => {
		const name = req.query.name;
		if (!name) {
			throw new Error("Missing name");
		}
		const result = await getPackageDependencyTopSort(name);

		return result;
	});
	return app;
}
