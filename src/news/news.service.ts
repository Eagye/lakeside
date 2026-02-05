import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from './news.entity';
import { NewsImageEntity } from './news-image.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    @InjectRepository(NewsImageEntity)
    private readonly newsImageRepository: Repository<NewsImageEntity>,
  ) {}

  async listAllNews(): Promise<NewsEntity[]> {
    return this.newsRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async listPublishedNews(): Promise<NewsEntity[]> {
    return this.newsRepository.find({
      where: { published: true },
      order: { sortOrder: 'ASC', publishDate: 'DESC' },
    });
  }

  async getNewsById(id: number): Promise<NewsEntity> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News article not found');
    }
    return news;
  }

  async getNewsWithImages(id: number): Promise<{ news: NewsEntity; images: NewsImageEntity[] }> {
    const news = await this.getNewsById(id);
    const images = await this.newsImageRepository.find({
      where: { newsId: id },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    return { news, images };
  }

  async createNews(
    title: string,
    content: string,
    excerpt: string,
    author: string,
    featured: boolean,
    published: boolean,
    publishDate: string,
  ): Promise<NewsEntity> {
    const news = this.newsRepository.create({
      title,
      content,
      excerpt: excerpt || '',
      author: author || '',
      featured: featured || false,
      published: published || false,
      publishDate: publishDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return this.newsRepository.save(news);
  }

  async updateNews(
    id: number,
    title: string,
    content: string,
    excerpt: string,
    author: string,
    featured: boolean,
    published: boolean,
    publishDate: string,
  ): Promise<NewsEntity> {
    const news = await this.getNewsById(id);
    news.title = title;
    news.content = content;
    news.excerpt = excerpt || '';
    news.author = author || '';
    news.featured = featured || false;
    news.published = published || false;
    news.publishDate = publishDate || news.publishDate;
    news.updatedAt = new Date().toISOString();
    return this.newsRepository.save(news);
  }

  async updateCoverImage(id: number, url: string): Promise<NewsEntity> {
    const news = await this.getNewsById(id);
    news.coverImageUrl = url;
    news.updatedAt = new Date().toISOString();
    return this.newsRepository.save(news);
  }

  async deleteNews(id: number): Promise<void> {
    const news = await this.getNewsById(id);
    
    // Delete all associated images first
    const images = await this.newsImageRepository.find({ where: { newsId: id } });
    for (const image of images) {
      await this.deleteImage(image.id);
    }

    // Delete cover image if exists
    if (news.coverImageUrl) {
      try {
        const filepath = join(process.cwd(), 'public', news.coverImageUrl);
        await unlink(filepath);
      } catch (error) {
        console.error('Error deleting cover image file:', error);
      }
    }

    await this.newsRepository.remove(news);
  }

  async listImages(newsId: number): Promise<NewsImageEntity[]> {
    return this.newsImageRepository.find({
      where: { newsId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async addImages(newsId: number, files: Express.Multer.File[]): Promise<NewsImageEntity[]> {
    const news = await this.getNewsById(newsId);
    const images: NewsImageEntity[] = [];

    for (const file of files) {
      const image = this.newsImageRepository.create({
        newsId: news.id,
        filename: file.filename,
        url: `/uploads/news/${file.filename}`,
        createdAt: new Date().toISOString(),
      });
      images.push(await this.newsImageRepository.save(image));
    }

    return images;
  }

  async updateImageCaption(id: number, caption: string): Promise<NewsImageEntity> {
    const image = await this.newsImageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    image.caption = caption || '';
    return this.newsImageRepository.save(image);
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.newsImageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    try {
      const filepath = join(process.cwd(), 'public', image.url);
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    await this.newsImageRepository.remove(image);
  }
}
