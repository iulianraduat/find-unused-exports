import * as fs from "fs";

export const readJsonFile = (
  path: string
): { [kes: string]: any } | undefined => {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
};

export const readFile = (path: string): string => fs.readFileSync(path, "utf8");

export const isDirectory = (path: string): boolean => {
  try {
    return fs.lstatSync(path).isDirectory();
  } catch (error) {
    return false;
  }
};

export const isFile = (path: string): boolean => {
  try {
    return fs.lstatSync(path).isFile();
  } catch (error) {
    return false;
  }
};

/*
export const writeFile = (path: string, content: string) =>
  fs.writeFileSync(path, content, "utf8");

export const writeJsonFile = (path: string, obj: object) =>
  writeFile(path, JSON.stringify(obj, undefined, 2));

export const appendFile = (path: string, content: string) =>
  fs.appendFileSync(path, content, "utf8");

export const appendJsonFile = (path: string, obj: object) =>
  fs.appendFileSync(path, JSON.stringify(obj, undefined, 2), "utf8");
*/
