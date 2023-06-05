import { BEM, createBEM } from "./bem";

export type CreateNamespaceReturn = [BEM, string];

export function createNamespace(name: string, customPrefix?: string): CreateNamespaceReturn {
  name = `${customPrefix || "owl"}-${name}`;
  return [createBEM(name), name];
}
