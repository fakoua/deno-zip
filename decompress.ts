import { exists, join } from "./deps.ts";
interface DecompressOptions {
  overwrite?: boolean;
  includeFileName?: boolean;
}
/**
 * Decompresses a zip file.
 * @param filePath - The path to the zip file.
 * @param destinationPath - The path where the extracted files will be placed. Defaults to "./" if not provided.
 * @param options - Optional decompression options.
 * @returns A promise that resolves to the path of the extracted files, or `false` if the decompression process failed.
 * @throws Throws an error if the zip file does not exist.
 */
export const decompress = async (
  filePath: string,
  destinationPath: string | null = "./",
  options?: DecompressOptions,
): Promise<string | false> => {
  // check if the zip file is exist
  if (!await exists(filePath)) {
    throw "this file does not found";
  }
  // check destinationPath is not null and set './' as destinationPath
  if (!destinationPath) {
    destinationPath = "./";
  }

  // the file name with aut extension
  const fileNameWithOutExt = getFileNameFromPath(filePath);
  // get the extract file and add fileNameWithOutExt whene options.includeFileName is true
  const fullDestinationPath = options?.includeFileName
    ? join(destinationPath, fileNameWithOutExt)
    : destinationPath;

  // return the unzipped file path or false whene the unzipping Process failed
  return await decompressProcess(filePath, fullDestinationPath, options)
    ? fullDestinationPath
    : false;
};

const decompressProcess = async (
  zipSourcePath: string,
  destinationPath: string,
  options?: DecompressOptions,
): Promise<boolean> => {
  const cmd = Deno.build.os === "windows" ? "PowerShell" : "unzip";
  const args = Deno.build.os === "windows"
    ? [
      "Expand-Archive",
      "-Path",
      `"${zipSourcePath}"`,
      "-DestinationPath",
      `"${destinationPath}"`,
      options?.overwrite ? "-Force" : "",
    ]
    : [options?.overwrite ? "-o" : "", zipSourcePath, "-d", destinationPath];
  const p = new Deno.Command(cmd, {
    args: args,
    stderr: "piped",
    stdout: "piped",
  });
  const child = p.spawn();
  const processStatus = (await child.status).success;
  return processStatus;
};

function getFileNameFromPath(filePath: string): string {
  return filePath.split("/").at(-1)?.split(".").slice(0, -1).join(".") || "";
}
