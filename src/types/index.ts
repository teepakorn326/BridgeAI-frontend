export interface SubtitleLine {
  start_seconds: number;
  end_seconds: number;
  text_en: string;
  text_translated: string;
}

export interface ProcessRequest {
  video_url: string;
  target_lang: string;
}

export interface ProcessResponse {
  video_id: string;
  video_url: string;
  source?: string;
  target_lang: string;
  title: string;
  subtitles: SubtitleLine[];
  from_cache: boolean;
}

// Document pipeline (PDF / DOCX / PPTX / TXT / image). Lives separately from
// lectures because there is no time dimension — page + reading order replace
// timestamps as the navigation/citation key.
export interface DocumentBlock {
  page: number;
  order: number;
  text_en: string;
  text_translated: string;
}

export interface DocumentResponse {
  document_id: string;
  source_url: string;
  source: string; // pdf|docx|pptx|txt|image
  target_lang: string;
  title: string;
  blocks: DocumentBlock[];
  from_cache: boolean;
}

export interface DocumentSummary {
  document_id: string;
  source_url: string;
  source: string;
  title: string;
  target_lang: string;
}

export interface DocumentChatCitation {
  n: number;
  page: number;
  order: number;
  text_en: string;
}

export interface DocumentLesson {
  title_en: string;
  title_translated: string;
  summary: string;
  summary_citations: DocumentChatCitation[];
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export interface LectureChatCitation {
  n: number;
  start_seconds: number;
  end_seconds: number;
  text_en: string;
}

export interface LectureLesson {
  start_seconds: number;
  end_seconds: number;
  title_en: string;
  title_translated: string;
  summary: string;
  summary_citations: LectureChatCitation[];
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}
