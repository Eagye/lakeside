export interface HomeContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  summary: string;
}

export interface SiteContent {
  home: HomeContent;
  about: AboutContent;
  updatedAt: string;
}
