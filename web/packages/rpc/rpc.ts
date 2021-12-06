// @ts-ignore
const rpc = window.go;

export function MultipleRegulationsFilePicker(): Promise<string[]> {
  return rpc.api.Common.MultipleRegulationsFilePicker();
}

export function GetFileContent(filePath: string): Promise<string> {
  return rpc.api.Common.ReadFile(filePath);
}

export function PostForm(
  url: string,
  field: string,
  filePath: string
): Promise<Record<string, unknown>> {
  return rpc.api.Common.UploadFile(url, field, filePath);
}
