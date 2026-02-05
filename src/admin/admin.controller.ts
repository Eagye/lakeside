import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Render,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ContentService } from '../content/content.service';
import { SiteContent } from '../content/content.types';
import { HeroImageService } from '../hero-images/hero-image.service';
import { OfferService } from '../offers/offer.service';
import { TestimonialService } from '../testimonials/testimonial.service';
import { TeamService } from '../team/team.service';
import { AboutImageService } from '../about-images/about-image.service';
import { AboutIntroImageService } from '../about-intro-images/about-intro-image.service';
import { FeatureImageService } from '../feature-images/feature-image.service';
import { ServicesService } from '../services/services.service';
import { GreenhouseVideoService } from '../greenhouse-video/greenhouse-video.service';
import { AboutAccentService } from '../about-accent/about-accent.service';
import { NewsService } from '../news/news.service';
import { BranchService } from '../branches/branch.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(
    private readonly contentService: ContentService,
    private readonly heroImageService: HeroImageService,
    private readonly offerService: OfferService,
    private readonly testimonialService: TestimonialService,
    private readonly teamService: TeamService,
    private readonly aboutImageService: AboutImageService,
    private readonly aboutIntroImageService: AboutIntroImageService,
    private readonly featureImageService: FeatureImageService,
    private readonly servicesService: ServicesService,
    private readonly branchService: BranchService,
    private readonly greenhouseVideoService: GreenhouseVideoService,
    private readonly aboutAccentService: AboutAccentService,
    private readonly newsService: NewsService,
  ) {}

  @Get()
  renderDashboard(@Res() res: Response) {
    res.render('admin-dashboard', { csrfToken: res.locals.csrfToken || '' });
  }

  @Get('content')
  async getContent() {
    return this.contentService.getContent();
  }

  @Put('content')
  async updateContent(@Body() body: Partial<SiteContent>) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Body must be an object');
    }
    return this.contentService.updateContent(body);
  }

  @Get('hero-images')
  async getHeroImages() {
    return this.heroImageService.listImages();
  }

  @Post('hero-images')
  @UseInterceptors(
    FilesInterceptor('images', 50, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'hero');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadHeroImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.heroImageService.addImages(files);
  }

  @Delete('hero-images/:id')
  async deleteHeroImage(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.heroImageService.deleteImage(parsedId);
    return { success: true };
  }

  @Get('offers')
  async getOffers() {
    return this.offerService.listCardsWithImages();
  }

  @Put('offers/:id')
  async updateOfferLabel(
    @Param('id') id: string,
    @Body('label') label: string,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Offer id is required');
    }
    return this.offerService.updateCard(parsedId, label?.trim());
  }

  @Get('offers/:id/images')
  async getOfferImages(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Offer id is required');
    }
    return this.offerService.listImages(parsedId);
  }

  @Post('offers/:id/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'offers');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadOfferImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Offer id is required');
    }
    return this.offerService.addImages(parsedId, files);
  }

  @Delete('offers/images/:imageId')
  async deleteOfferImage(@Param('imageId') imageId: string) {
    const parsedId = Number(imageId);
    if (!imageId || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.offerService.deleteImage(parsedId);
    return { success: true };
  }

  @Get('testimonials')
  async getTestimonials() {
    return this.testimonialService.listTestimonials();
  }

  @Post('testimonials')
  async createTestimonial(
    @Body('name') name: string,
    @Body('role') role: string,
    @Body('quote') quote: string,
    @Body('rating') rating: number,
  ) {
    return this.testimonialService.createTestimonial(
      name?.trim(),
      role?.trim(),
      quote?.trim(),
      Number(rating ?? 5),
    );
  }

  @Put('testimonials/:id')
  async updateTestimonial(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('role') role: string,
    @Body('quote') quote: string,
    @Body('rating') rating: number,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Testimonial id is required');
    }
    return this.testimonialService.updateTestimonial(
      parsedId,
      name?.trim(),
      role?.trim(),
      quote?.trim(),
      Number(rating ?? 5),
    );
  }

  @Delete('testimonials/:id')
  async deleteTestimonial(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Testimonial id is required');
    }
    await this.testimonialService.deleteTestimonial(parsedId);
    return { success: true };
  }

  @Post('testimonials/:id/avatar')
  @UseInterceptors(
    FilesInterceptor('avatar', 1, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(
            process.cwd(),
            'public',
            'uploads',
            'testimonials',
          );
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  async uploadTestimonialAvatar(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Testimonial id is required');
    }
    const file = files?.[0];
    if (!file) {
      throw new BadRequestException('Avatar image is required');
    }
    const url = `/uploads/testimonials/${file.filename}`;
    return this.testimonialService.updateAvatar(parsedId, url);
  }

  @Get('team')
  async getTeamMembers() {
    return this.teamService.listMembers();
  }

  @Post('team')
  async createTeamMember(
    @Body('name') name: string,
    @Body('role') role: string,
    @Body('description') description: string,
  ) {
    return this.teamService.createMember(
      name?.trim(),
      role?.trim(),
      description?.trim(),
    );
  }

  @Put('team/:id')
  async updateTeamMember(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('role') role: string,
    @Body('description') description: string,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Team member id is required');
    }
    return this.teamService.updateMember(
      parsedId,
      name?.trim(),
      role?.trim(),
      description?.trim(),
    );
  }

  @Delete('team/:id')
  async deleteTeamMember(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Team member id is required');
    }
    await this.teamService.deleteMember(parsedId);
    return { success: true };
  }

  @Post('team/:id/image')
  @UseInterceptors(
    FilesInterceptor('image', 1, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'team');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  async uploadTeamImage(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Team member id is required');
    }
    const file = files?.[0];
    if (!file) {
      throw new BadRequestException('Team image is required');
    }
    const url = `/uploads/team/${file.filename}`;
    return this.teamService.updateImage(parsedId, url);
  }

  @Get('about-images')
  async getAboutImages() {
    return this.aboutImageService.listImages();
  }

  @Post('about-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'about');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 6 * 1024 * 1024 },
    }),
  )
  async uploadAboutImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.aboutImageService.addImages(files);
  }

  @Delete('about-images/:id')
  async deleteAboutImage(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.aboutImageService.deleteImage(parsedId);
    return { success: true };
  }

  @Get('about-intro-images')
  async getAboutIntroImages() {
    return this.aboutIntroImageService.listImages();
  }

  @Post('about-intro-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'about-intro');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 6 * 1024 * 1024 },
    }),
  )
  async uploadAboutIntroImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.aboutIntroImageService.addImages(files);
  }

  @Delete('about-intro-images/:id')
  async deleteAboutIntroImage(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.aboutIntroImageService.deleteImage(parsedId);
    return { success: true };
  }

  // About Accent Images (small frame images)
  @Get('about-accent-images')
  async getAboutAccentImages() {
    return this.aboutAccentService.findAll();
  }

  @Post('about-accent-images')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'about-accent');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAboutAccentImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const imageUrl = `/uploads/about-accent/${file.filename}`;
    const image = await this.aboutAccentService.create(imageUrl);
    return image;
  }

  @Delete('about-accent-images/:id')
  async deleteAboutAccentImage(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.aboutAccentService.delete(parsedId);
    return { success: true };
  }

  @Get('feature-images')
  async getFeatureImages() {
    return this.featureImageService.listImages();
  }

  @Post('feature-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(
            process.cwd(),
            'public',
            'uploads',
            'feature',
          );
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 6 * 1024 * 1024 },
    }),
  )
  async uploadFeatureImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.featureImageService.addImages(files);
  }

  @Delete('feature-images/:id')
  async deleteFeatureImage(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.featureImageService.deleteImage(parsedId);
    return { success: true };
  }

  @Get('greenhouse-video')
  async getGreenhouseVideo() {
    return this.greenhouseVideoService.getVideo();
  }

  @Post('greenhouse-video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'greenhouse');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.mp4';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(
            new BadRequestException('Only video uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    }),
  )
  async uploadGreenhouseVideo(@UploadedFile() file: Express.Multer.File) {
    return this.greenhouseVideoService.uploadVideo(file);
  }

  @Delete('greenhouse-video/:id')
  async deleteGreenhouseVideo(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Video id is required');
    }
    await this.greenhouseVideoService.deleteVideo(parsedId);
    return { success: true };
  }

  @Get('services/categories')
  async getServiceCategories() {
    return this.servicesService.listCategoriesWithProducts();
  }

  @Post('services/categories')
  async createServiceCategory(
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    return this.servicesService.createCategory(
      name?.trim(),
      description?.trim(),
    );
  }

  @Put('services/categories/:id')
  async updateServiceCategory(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Category id is required');
    }
    return this.servicesService.updateCategory(
      parsedId,
      name?.trim(),
      description?.trim(),
    );
  }

  @Delete('services/categories/:id')
  async deleteServiceCategory(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Category id is required');
    }
    await this.servicesService.deleteCategory(parsedId);
    return { success: true };
  }

  @Post('services/categories/:id/image')
  @UseInterceptors(
    FilesInterceptor('image', 1, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'services');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 6 * 1024 * 1024 },
    }),
  )
  async uploadServiceCategoryImage(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Category id is required');
    }
    const file = files?.[0];
    if (!file) {
      throw new BadRequestException('Image is required');
    }
    await this.servicesService.addCategoryImages(parsedId, [file]);
    const url = `/uploads/services/${file.filename}`;
    return this.servicesService.updateCategoryImage(parsedId, url);
  }

  @Post('services/categories/:id/images')
  @UseInterceptors(
    FilesInterceptor('images', 12, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'services');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 6 * 1024 * 1024 },
    }),
  )
  async uploadServiceCategoryImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Category id is required');
    }
    return this.servicesService.addCategoryImages(parsedId, files);
  }

  @Delete('services/categories/images/:imageId')
  async deleteServiceCategoryImage(@Param('imageId') imageId: string) {
    const parsedId = Number(imageId);
    if (!imageId || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.servicesService.deleteCategoryImage(parsedId);
    return { success: true };
  }

  @Post('services/categories/:id/products')
  async createServiceProduct(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Category id is required');
    }
    return this.servicesService.createProduct(
      parsedId,
      name?.trim(),
      description?.trim(),
    );
  }

  @Put('services/products/:id')
  async updateServiceProduct(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Product id is required');
    }
    return this.servicesService.updateProduct(
      parsedId,
      name?.trim(),
      description?.trim(),
    );
  }

  @Delete('services/products/:id')
  async deleteServiceProduct(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Product id is required');
    }
    await this.servicesService.deleteProduct(parsedId);
    return { success: true };
  }

  // News management endpoints
  @Get('news')
  async getAllNews() {
    return this.newsService.listAllNews();
  }

  @Get('news/:id')
  async getNewsById(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('News id is required');
    }
    return this.newsService.getNewsWithImages(parsedId);
  }

  @Post('news')
  async createNews(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('excerpt') excerpt: string,
    @Body('author') author: string,
    @Body('featured') featured: boolean,
    @Body('published') published: boolean,
    @Body('publishDate') publishDate: string,
  ) {
    return this.newsService.createNews(
      title?.trim(),
      content?.trim(),
      excerpt?.trim(),
      author?.trim(),
      featured,
      published,
      publishDate,
    );
  }

  @Put('news/:id')
  async updateNews(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('excerpt') excerpt: string,
    @Body('author') author: string,
    @Body('featured') featured: boolean,
    @Body('published') published: boolean,
    @Body('publishDate') publishDate: string,
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('News id is required');
    }
    return this.newsService.updateNews(
      parsedId,
      title?.trim(),
      content?.trim(),
      excerpt?.trim(),
      author?.trim(),
      featured,
      published,
      publishDate,
    );
  }

  @Delete('news/:id')
  async deleteNews(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('News id is required');
    }
    await this.newsService.deleteNews(parsedId);
    return { success: true };
  }

  @Post('news/:id/cover')
  @UseInterceptors(
    FilesInterceptor('cover', 1, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'news');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `cover-${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadNewsCover(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('News id is required');
    }
    const file = files?.[0];
    if (!file) {
      throw new BadRequestException('Cover image is required');
    }
    const url = `/uploads/news/${file.filename}`;
    return this.newsService.updateCoverImage(parsedId, url);
  }

  @Get('news/:id/images')
  async getNewsImages(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('News id is required');
    }
    return this.newsService.listImages(parsedId);
  }

  @Post('news/:id/images')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads', 'news');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname) || '.jpg';
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        return cb(null, true);
      },
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadNewsImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('News id is required');
    }
    return this.newsService.addImages(parsedId, files);
  }

  @Put('news/images/:imageId/caption')
  async updateNewsImageCaption(
    @Param('imageId') imageId: string,
    @Body('caption') caption: string,
  ) {
    const parsedId = Number(imageId);
    if (!imageId || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    return this.newsService.updateImageCaption(parsedId, caption?.trim());
  }

  @Delete('news/images/:imageId')
  async deleteNewsImage(@Param('imageId') imageId: string) {
    const parsedId = Number(imageId);
    if (!imageId || Number.isNaN(parsedId)) {
      throw new BadRequestException('Image id is required');
    }
    await this.newsService.deleteImage(parsedId);
    return { success: true };
  }

  // ==================
  // Branch Management
  // ==================

  @Get('branches')
  async listBranches() {
    return await this.branchService.listBranches();
  }

  @Post('branches')
  async createBranch(@Body() body: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone?: string;
    description?: string;
    displayOrder?: number;
  }) {
    if (!body.name || !body.address || body.latitude === undefined || body.longitude === undefined) {
      throw new BadRequestException('Name, address, latitude, and longitude are required');
    }
    return await this.branchService.createBranch(body);
  }

  @Put('branches/:id')
  async updateBranch(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      phone?: string;
      description?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Branch id is required');
    }
    const branch = await this.branchService.updateBranch(parsedId, body);
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }
    return branch;
  }

  @Delete('branches/:id')
  async deleteBranch(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new BadRequestException('Branch id is required');
    }
    const deleted = await this.branchService.deleteBranch(parsedId);
    if (!deleted) {
      throw new BadRequestException('Branch not found');
    }
    return { success: true };
  }
}
