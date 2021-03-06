export type ID = string | number;

export enum SOURCE_TYPE {
  JS = 'JS',
  CSS = 'CSS',
}

export enum STATUS {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

export enum RUN_AT {
  DOCUMENT_START = 'document_start',
  DOCUMENT_IDLE = 'document_idle',
  DOCUMENT_END = 'document_end',
}

export interface SourceFile {
  id: ID;
  sourceType: SOURCE_TYPE;
  content: string;
  status: STATUS;
  runAt: RUN_AT;
  // createTime: number;
  // updateTime: number;
}

export enum MATCH_TYPE {
  ALL = 'ALL',
  DOMAIN = 'DOMAIN',
}

export interface Rule {
  id: ID;
  filesSetId: ID;
  regexContent: string;
  status: STATUS;
  matchType: MATCH_TYPE;
}

export interface FileSet {
  id: ID;
  name: string;
  sourceFileIds: ID[];
  status: STATUS;
  ruleIds: ID[];
}

export type FileSetWithRule = FileSet & {
  ruleList: Rule[];
};

export type FileSetDetail = FileSet & {
  ruleList: Rule[];
  sourceFileList: SourceFile[];
};

export enum DATA_IMPORT_EXIST_BEHAVIOR {
  OVERRIDE = 'OVERRIDE',
  SKIP = 'SKIP',
}

export enum EXTENSION_GLOBAL_OPTIONS_KEY {
  version = 'version',
  status = 'status',
  popupTipForRefresh = 'popupTipForRefresh',

  useCodeEditor = 'useCodeEditor',
  codemirrorTheme = 'codemirrorTheme',
  codemirrorLineNumbers = 'codemirrorLineNumbers',

  dataImportExistBehavior = 'dataImportExistBehavior',
}

export interface ExtensionGlobalOptions {
  [EXTENSION_GLOBAL_OPTIONS_KEY.status]?: STATUS;
  [EXTENSION_GLOBAL_OPTIONS_KEY.popupTipForRefresh]?: boolean;
  [EXTENSION_GLOBAL_OPTIONS_KEY.version]?: string;
  [EXTENSION_GLOBAL_OPTIONS_KEY.useCodeEditor]?: boolean;
  [EXTENSION_GLOBAL_OPTIONS_KEY.codemirrorTheme]?: string;
  [EXTENSION_GLOBAL_OPTIONS_KEY.codemirrorLineNumbers]?: boolean;
  [EXTENSION_GLOBAL_OPTIONS_KEY.dataImportExistBehavior]?: DATA_IMPORT_EXIST_BEHAVIOR;
}
