export interface Source {
  title: string;
  uri: string;
}

export interface ArticleData {
  headline: string;
  subheadline: string;
  author: string;
  location: string;
  date: string;
  paragraphs: string[];
  imagePrompt: string;
  sources: Source[];
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  DISPLAY = 'DISPLAY',
  ERROR = 'ERROR',
  API_KEY_SELECT = 'API_KEY_SELECT'
}

export interface GeneratedImage {
  url: string;
  caption: string;
}