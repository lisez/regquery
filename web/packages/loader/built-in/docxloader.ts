import BaseLoader, {
  IContent,
  IFileContent,
} from "@regquery/loader/base/BaseLoader";
import type {
  ILoaderConfig,
  IContentObject,
  IContentItem,
} from "@regquery/loader/base/BaseLoader";
import * as rpc from "@regquery/rpc";

export interface IDocxLoaderConfig extends ILoaderConfig {
  readonly parserURL: string;
}

export interface IDocxParsedResult extends IFileContent {
  readonly failed: boolean;
}

export class Loader extends BaseLoader<IDocxLoaderConfig> {
  static get DefaultConfig(): IDocxLoaderConfig {
    return {
      parserURL: "",
    };
  }

  constructor(public config: Partial<IDocxLoaderConfig>) {
    super(config);
    this.config = { ...Loader.DefaultConfig, ...config };
  }

  public test(filepath: string): boolean {
    return filepath.endsWith(".docx");
  }

  public extract = async (filepath: string): Promise<IFileContent> => {
    const resp = await rpc.PostForm(this.config.parserURL, "file", filepath);

    if (resp.statusCode !== 200) {
      throw new Error(`${resp.status} ${resp.statusText}`);
    }

    return JSON.parse(resp.body as string);
  };

  private flatIssue = (source: Record<string, unknown>): IContentObject[] => {
    const srcObj = {
      title:
        ((source.issue_type as string) || "<??>") +
        ((source.no as string) || "??"),
      content: (source.issue_content as string) || "(??)",
    };

    if (Array.isArray(source.child) && !!source.child.length) {
      const children: IContentObject[] = []
        .concat(
          ...(source.child as Record<string, unknown>[]).map((el) =>
            this.flatIssue(el)
          )
        )
        .map((el) => ({ title: srcObj.title + el.title, content: el.content }));
      return [srcObj, ...children];
    }
    return [srcObj];
  };

  public async transform(
    filename: string,
    filedata: IFileContent
  ): Promise<IContent> {
    const result = (filedata.payload as Record<string, unknown>)
      .result as Record<string, unknown>;

    const title = (result.name as string) || filename;
    const objects: IContentItem[] = []
      .concat(
        ...(result.law_content as Record<string, unknown>[]).map((el) =>
          this.flatIssue(el)
        )
      )
      .map((object, index) => ({
        object,
        index,
        hash: `${title} ${object.title || index}`,
      }));

    return { title, objects };
  }
}
