import sorting from "../algorithms/sorting";
import { ARCH_SEARCH_URL } from "../constants/archapi";
import { ArchPackageSearchResource } from "../types/Arch";
import { Tree, constructPath, createTree } from "../types/Tree";
import { isEmptyString } from "../utils/string.utils";

const BATTCH_SIZE = 1;
export async function getPackageDependencyTopSort(packageName: string) {
  const dependencies = await resolvePackageDependenciesNested(packageName);
  const sortedDependencies = sorting.topSort(dependencies.getData());
  return sortedDependencies;
}
const packageDependencyResolver = createPackageDependencyResolver();
export async function resolvePackageDependenciesNested(
  packageName: string,
): Promise<Tree> {
  const dependencyTree = createTree();
  const queue: { path: string; name: string }[] = [
    { path: "", name: packageName },
  ];
  const promises: Promise<void>[] = [];
  while (queue.length > 0) {
    const batchDependencies = queue.splice(0, BATTCH_SIZE);
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
  }
  await Promise.all(promises);
  return dependencyTree;
}

function createPackageDependencyResolver() {
  const cache = new Map<string, string[]>();
  return async (packageName: string): Promise<string[]> => {
    if (cache.has(packageName)) {
      return cache.get(packageName) as string[];
    }
    const dependencies = await resolvePackageDependencies(packageName);
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
  try {
    const result = await fetch(`${ARCH_SEARCH_URL}?name=${packageName}`)

    const response: ArchPackageSearchResource = await result.json()
    return (
      response.results[0]?.depends
        .map((d) => getPackgeName(d))
        .filter((d) => !isEmptyString(d)) ?? []
    );
  }
  catch (ex) {
    throw ex
  }
}
