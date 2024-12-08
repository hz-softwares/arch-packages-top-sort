import { TreeData } from "../types/Tree";

function topSort(tree: TreeData): string[] {
	if (Object.keys(tree).length === 0) {
		return [];
	}
	const topSorted: string[] = [];
	Object.keys(tree).forEach((key) => {
		topSorted.push(...topSort(tree[key]).filter((p) => !topSorted.includes(p)));
		if (!topSorted.includes(key)) {
			topSorted.push(key);
		}
	});
	return topSorted;
}

export default {
	topSort,
};
