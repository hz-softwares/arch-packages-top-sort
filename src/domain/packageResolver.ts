import sorting from "../algorithms/sorting";
import { ARCH_SEARCH_URL } from "../constants/archapi";
import { ArchPackageSearchResource } from "../types/Arch";
import { PATH_DELIM, Tree, constructPath, createTree } from "../types/Tree";
import { isEmptyString } from "../utils/string.utils";

const BATTCH_SIZE = 5;
export async function getPackageDependencyTopSort(packageName: string) {
	const dependencies = await resolvePackageDependenciesNested(packageName);
	// console.log(dependencies);
	const sortedDependencies = sorting.topSort(dependencies.getData());
	return sortedDependencies;
}
export async function resolvePackageDependenciesNested(
	packageName: string,
): Promise<Tree> {
	const dependencyTree = createTree();
	const queue: { path: string; name: string }[] = [
		{ path: "", name: packageName },
	];
	const packageDependencyResolver = createPackageDependencyResolver();
	while (queue.length > 0) {
		// console.log("queue", queue);
		const batchDependencies = queue.splice(0, BATTCH_SIZE);
		const promises: Promise<void>[] = [];
		batchDependencies.forEach((currentDependency) => {
			const currentParentPath = constructPath([
				currentDependency.path,
				currentDependency.name,
			]);
			promises.push(
				packageDependencyResolver(currentDependency.name).then(
					(dependencies) => {
						if (dependencies.length === 0) {
							return;
						}
						// console.log("dependencies", dependencies);
						dependencyTree.addNode(currentParentPath, dependencies);
						queue.push(
							...dependencies.map((d) => ({
								path: currentParentPath,
								name: d,
							})),
						);
					},
				),
			);
		});
		await Promise.all(promises);
	}
	// const result = await Promise.all(promises);
	// console.log("result", result);
	return dependencyTree;
}

function createPackageDependencyResolver() {
	const cache = new Map<string, string[]>();
	return async (packageName: string): Promise<string[]> => {
		if (cache.has(packageName)) {
			// console.log("cache hit", packageName);
			return cache.get(packageName) as string[];
		}
		// console.log("cache miss", packageName);
		const dependencies = await resolvePackageDependencies(packageName);
		console.log(dependencies);
		cache.set(packageName, dependencies);
		return dependencies;
	};
}
function getPackgeName(name: string) {
	if (isEmptyString(name)) {
		return "";
	}
	return name.match(/^[a-zA-Z0-9-.]+/)?.[0] ?? "";
}

export async function resolvePackageDependencies(packageName: string) {
	const response: ArchPackageSearchResource = await (
		await fetch(`${ARCH_SEARCH_URL}?name=${packageName}`)
	).json();
	return (
		response.results[0]?.depends
			.map((d) => getPackgeName(d))
			.filter((d) => !isEmptyString(d)) ?? []
	);
}
