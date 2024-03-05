import { exists, join } from "./deps.ts";
interface CompressOptions {
  overwrite?: boolean;
  flags?: string[];
}

/**
 * Compresses the specified files into an archive.
 *
 * @param files - The file(s) to compress. It can be a single file or an array of files.
 * @param archiveName - The name of the archive file. Defaults to "./archive.zip".
 * @param options - Optional compress options.
 * @returns A promise that resolves to a boolean indicating whether the compression was successful.
 */
export const compress = async (
  files: string | string[],
  archiveName: string = "./archive.zip",
  options?: CompressOptions,
): Promise<boolean> => {
  return await compressProcess(files, archiveName, options);
};

const compressProcess = async (
  files: string | string[],
  archiveName: string = "./archive.zip",
  options?: CompressOptions,
): Promise<boolean> => {
  if (await exists(archiveName) && !(options?.overwrite)) {
    throw `The archive file ${
      join(Deno.cwd(), archiveName)
    }.zip already exists, Use the {overwrite: true} option to overwrite the existing archive file`;
  }
  const filesList = typeof files === "string"
    ? files
    : files.join(Deno.build.os === "windows" ? ", " : " ");

  const cmd = Deno.build.os === "windows" ? "PowerShell" : "zip";
  const args = Deno.build.os === "windows"
    ? [
      "Compress-Archive",
      "-Path",
      filesList,
      "-DestinationPath",
      archiveName,
      options?.overwrite ? "-Force" : "",
    ]
    : ["-r", ...options?.flags ?? [], archiveName, ...filesList.split(" ")];
  const p = new Deno.Command(cmd, {
    args: args,
    stderr: "piped",
    stdout: "piped",
  });
  const child = p.spawn();
  const processStatus = (await child.status).success;
  return processStatus;
};
