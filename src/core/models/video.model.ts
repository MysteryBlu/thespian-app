export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

export interface Folder {
  displayName: string;
  name: string;
  video: string;
  captions: string;
}

export interface FolderList {
  folders: Folder[];
}