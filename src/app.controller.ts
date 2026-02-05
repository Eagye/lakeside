import { Controller, Get, Param, Render, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContentService } from './content/content.service';
import { HeroImageService } from './hero-images/hero-image.service';
import { OfferService } from './offers/offer.service';
import { TestimonialService } from './testimonials/testimonial.service';
import { TeamService } from './team/team.service';
import { AboutImageService } from './about-images/about-image.service';
import { AboutIntroImageService } from './about-intro-images/about-intro-image.service';
import { FeatureImageService } from './feature-images/feature-image.service';
import { ServicesService } from './services/services.service';
import { GreenhouseVideoService } from './greenhouse-video/greenhouse-video.service';
import { AboutAccentService } from './about-accent/about-accent.service';
import { NewsService } from './news/news.service';
import { EmailService } from './common/email.service';
import { BranchService } from './branches/branch.service';

@Controller()
export class AppController {
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
    private readonly greenhouseVideoService: GreenhouseVideoService,
    private readonly aboutAccentService: AboutAccentService,
    private readonly newsService: NewsService,
    private readonly emailService: EmailService,
    private readonly branchService: BranchService,
  ) {}

  private getSocialMediaLinks() {
    return {
      facebook: process.env.FACEBOOK_URL || '',
      twitter: process.env.TWITTER_URL || '',
      instagram: process.env.INSTAGRAM_URL || '',
      linkedin: process.env.LINKEDIN_URL || '',
    };
  }

  /**
   * Health check endpoint for monitoring
   * Returns 200 OK if the application is running
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get()
  @Render('index')
  async renderHome() {
    const [content, heroImages, offers, testimonials, aboutIntroImages, greenhouseVideo] = await Promise.all([
      this.contentService.getPublicContent(),
      this.heroImageService.listImages(),
      this.offerService.listCardsWithImages(),
      this.testimonialService.listTestimonials(),
      this.aboutIntroImageService.listImages(),
      this.greenhouseVideoService.getVideo(),
    ]);
    const testimonialCards = testimonials.map((testimonial) => ({
      ...testimonial,
      stars: Array.from({ length: testimonial.rating ?? 5 }),
      initials: testimonial.name
        ? testimonial.name
            .split(' ')
            .map((part) => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'LF',
    }));
    return {
      content,
      heroImages,
      hasHeroImages: heroImages.length > 0,
      offers,
      hasOffers: offers.length > 0,
      testimonials: testimonialCards,
      hasTestimonials: testimonialCards.length > 0,
      aboutIntroImages,
      hasAboutIntroImages: aboutIntroImages.length > 0,
      greenhouseVideo,
      hasGreenhouseVideo: !!greenhouseVideo,
      socialMedia: this.getSocialMediaLinks(),
    };
  }

  @Get('about')
  @Render('about')
  async renderAbout() {
    const [content, team, aboutImages, featureImages, accentImages] = await Promise.all([
      this.contentService.getPublicContent(),
      this.teamService.listMembers(),
      this.aboutImageService.listImages(),
      this.featureImageService.listImages(),
      this.aboutAccentService.findAll(),
    ]);
    return {
      content,
      team,
      hasTeam: team.length > 0,
      aboutImages,
      hasAboutImages: aboutImages.length > 0,
      accentImages,
      hasAccentImages: accentImages.length > 0,
      featureImages,
      hasFeatureImages: featureImages.length > 0,
      socialMedia: this.getSocialMediaLinks(),
    };
  }

  @Get('services')
  @Render('services')
  async renderServices() {
    const categories = await this.servicesService.listCategoriesWithProducts();
    return {
      categories,
      hasCategories: categories.length > 0,
      socialMedia: this.getSocialMediaLinks(),
    };
  }

  @Get('contact')
  @Render('contact')
  async renderContact() {
    const [content, branches] = await Promise.all([
      this.contentService.getPublicContent(),
      this.branchService.listActiveBranches(),
    ]);
    return {
      content,
      branches,
      hasBranches: branches.length > 0,
      socialMedia: this.getSocialMediaLinks(),
    };
  }

  @Get('news')
  @Render('news')
  async renderNews() {
    const news = await this.newsService.listPublishedNews();
    const newsWithImages = await Promise.all(
      news.map(async (item) => {
        const images = await this.newsService.listImages(item.id);
        return { ...item, images };
      }),
    );
    return {
      news: newsWithImages,
      hasNews: newsWithImages.length > 0,
      socialMedia: this.getSocialMediaLinks(),
    };
  }

  @Get('news/:id')
  @Render('news-detail')
  async renderNewsDetail(@Param('id') id: string) {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      throw new Error('Invalid news ID');
    }
    const { news, images } = await this.newsService.getNewsWithImages(parsedId);
    
    // Get other recent news for sidebar
    const allNews = await this.newsService.listPublishedNews();
    const otherNews = allNews.filter((n) => n.id !== parsedId).slice(0, 5);

    return {
      news,
      images,
      hasImages: images.length > 0,
      otherNews,
      hasOtherNews: otherNews.length > 0,
      socialMedia: this.getSocialMediaLinks(),
    };
  }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async submitContactForm(
    @Body() body: { name: string; email: string; message: string },
  ) {
    try {
      // Validate input
      if (!body.name || !body.email || !body.message) {
        return {
          success: false,
          message: 'All fields are required',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return {
          success: false,
          message: 'Invalid email address',
        };
      }

      // Send email to admin
      const emailSent = await this.emailService.sendContactFormEmail(body);

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send email. Please try WhatsApp or call us directly.',
        };
      }

      // Send auto-reply to user
      await this.emailService.sendAutoReply(body.email, body.name);

      return {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred. Please try again or contact us via WhatsApp.',
      };
    }
  }
}
