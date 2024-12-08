import _ from "lodash";
import { KeyValuePair } from "./common";
import { isEmptyString } from "../utils/string.utils";

export type TreeData = KeyValuePair<TreeData>;
export const PATH_DELIM = ".";
function setToValue(object: object, path: string, value: any) {
	_.set(object, path, value);
}
export interface Tree {
	getData: () => TreeData;
	setData: (data: TreeData) => void;
	addNode: (path: string, value: string[]) => void;
	getNode: (path: string) => Tree;
	hasChildren: () => boolean;
}
export function createTree(): Tree {
	let data = {};
	return {
		getData: () => data,
		setData: (data: TreeData) => {
			data = data;
		},
		addNode: (path: string, value: string[]) => {
			const valueTree = value.reduce((prev, curr) => {
				prev[curr] = {};
				return prev;
			}, {} as TreeData);
			setToValue(data, path, valueTree);
		},
		getNode: (path: string) => {
			const node = createTree();
			node.setData(_.get(data, path));
			return node;
		},
		hasChildren: () => Object.keys(data).length > 0,
	};
}

export function constructPath(path: string[]) {
	if (path.length === 0) {
		return "";
	}
	return path.filter((p) => !isEmptyString(p)).join(PATH_DELIM);
}
