export interface ILoaderConfig {
  readonly [key: string]: unknown;
}

export interface IFileContent {
  readonly [key: string]: unknown;
}

export interface IContentObject {
  readonly title: string;
  readonly content: string;
}

export interface IContentItem {
  readonly object: Readonly<IContentObject>;
  readonly index?: number;
  readonly hash?: string;
}

export interface IContent {
  readonly title: string;
  readonly hash?: string;
  readonly objects: Readonly<IContentItem>[];
}

export default abstract class Loader<C extends ILoaderConfig> {
  constructor(public config: Partial<C>) {}
  abstract test(filepath: string): boolean;
  abstract extract(filepath: string): Promise<IFileContent>;
  abstract transform(
    filename: string,
    filedata: IFileContent
  ): Promise<IContent>;
}
