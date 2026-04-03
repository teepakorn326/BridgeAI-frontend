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
  target_lang: string;
  title: string;
  subtitles: SubtitleLine[];
  from_cache: boolean;
}
