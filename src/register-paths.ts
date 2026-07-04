import path from "path";
import Module from "module";

const aliasPrefix = "@/";
const originalResolveFilename = (Module as any)._resolveFilename;

(Module as any)._resolveFilename = function resolveAlias(
  request: string,
  parent: unknown,
  isMain: boolean,
  options: unknown
) {
  if (request.startsWith(aliasPrefix)) {
    const resolvedRequest = path.join(__dirname, request.slice(aliasPrefix.length));
    return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
