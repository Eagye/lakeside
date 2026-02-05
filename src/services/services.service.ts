import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { ServiceCategoryEntity } from './services-category.entity';
import { ServiceCategoryImageEntity } from './services-category-image.entity';
import { ServiceProductEntity } from './services-product.entity';

const SERVICE_CATEGORY_IMAGE_LIMIT = 12;

@Injectable()
export class ServicesService implements OnModuleInit {
  constructor(
    @InjectRepository(ServiceCategoryEntity)
    private readonly categoryRepository: Repository<ServiceCategoryEntity>,
    @InjectRepository(ServiceCategoryImageEntity)
    private readonly categoryImageRepository: Repository<ServiceCategoryImageEntity>,
    @InjectRepository(ServiceProductEntity)
    private readonly productRepository: Repository<ServiceProductEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureSeeded();
  }

  async listCategoriesWithProducts() {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const products = await this.productRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const images = await this.categoryImageRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return categories.map((category) => ({
      ...category,
      imageUrl:
        images.find((image) => image.categoryId === category.id)?.url ??
        category.imageUrl,
      products: products.filter(
        (product) => product.categoryId === category.id,
      ),
      images: images.filter((image) => image.categoryId === category.id),
    }));
  }

  async createCategory(name: string, description: string) {
    if (!name) {
      throw new BadRequestException('Category name is required');
    }
    const count = await this.categoryRepository.count();
    const category = this.categoryRepository.create({
      name,
      description: description ?? '',
      imageUrl: '',
      sortOrder: count,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, name: string, description: string) {
    if (!name) {
      throw new BadRequestException('Category name is required');
    }
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    category.name = name;
    category.description = description ?? '';
    return this.categoryRepository.save(category);
  }

  async updateCategoryImage(id: number, imageUrl: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    category.imageUrl = imageUrl ?? '';
    return this.categoryRepository.save(category);
  }

  async listCategoryImages(categoryId: number) {
    return this.categoryImageRepository.find({
      where: { categoryId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async addCategoryImages(categoryId: number, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const count = await this.categoryImageRepository.count({
      where: { categoryId },
    });
    if (count + files.length > SERVICE_CATEGORY_IMAGE_LIMIT) {
      throw new BadRequestException(
        `Category images limit is ${SERVICE_CATEGORY_IMAGE_LIMIT}`,
      );
    }

    const now = new Date().toISOString();
    const existing = await this.categoryImageRepository.find({
      where: { categoryId },
      order: { sortOrder: 'DESC', id: 'DESC' },
      take: 1,
    });
    const startOrder = existing[0]?.sortOrder ?? 0;

    const entities = files.map((file, index) =>
      this.categoryImageRepository.create({
        categoryId,
        filename: file.filename,
        url: `/uploads/services/${file.filename}`,
        sortOrder: startOrder + index + 1,
        createdAt: now,
      }),
    );
    const saved = await this.categoryImageRepository.save(entities);

    if (!category.imageUrl && saved[0]) {
      category.imageUrl = saved[0].url;
      await this.categoryRepository.save(category);
    }

    return saved;
  }

  async deleteCategoryImage(id: number) {
    const image = await this.categoryImageRepository.findOne({ where: { id } });
    if (!image) {
      return;
    }
    await this.categoryImageRepository.delete({ id });
    const category = await this.categoryRepository.findOne({
      where: { id: image.categoryId },
    });
    if (category && category.imageUrl === image.url) {
      const remaining = await this.categoryImageRepository.find({
        where: { categoryId: image.categoryId },
        order: { sortOrder: 'ASC', id: 'ASC' },
        take: 1,
      });
      category.imageUrl = remaining[0]?.url ?? '';
      await this.categoryRepository.save(category);
    }
    await this.safeDeleteFile(
      join(process.cwd(), 'public', image.url.replace(/^\//, '')),
    );
  }

  async deleteCategory(id: number) {
    await this.productRepository.delete({ categoryId: id });
    const images = await this.categoryImageRepository.find({
      where: { categoryId: id },
    });
    await this.categoryImageRepository.delete({ categoryId: id });
    await Promise.all(
      images.map((image) =>
        this.safeDeleteFile(
          join(process.cwd(), 'public', image.url.replace(/^\//, '')),
        ),
      ),
    );
    await this.categoryRepository.delete({ id });
  }

  async createProduct(categoryId: number, name: string, description: string) {
    if (!name) {
      throw new BadRequestException('Product name is required');
    }
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    const count = await this.productRepository.count({
      where: { categoryId },
    });
    const product = this.productRepository.create({
      categoryId,
      name,
      description: description ?? '',
      sortOrder: count,
    });
    return this.productRepository.save(product);
  }

  async updateProduct(id: number, name: string, description: string) {
    if (!name) {
      throw new BadRequestException('Product name is required');
    }
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    product.name = name;
    product.description = description ?? '';
    return this.productRepository.save(product);
  }

  async deleteProduct(id: number) {
    await this.productRepository.delete({ id });
  }

  private async safeDeleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch {
      return;
    }
  }

  private async ensureSeeded() {
    const count = await this.categoryRepository.count();
    if (count > 0) {
      return;
    }
    const categories = [
      {
        name: 'Crop Production',
        description:
          'Seasonal and staple crop cultivation with quality grading and steady supply.',
        sortOrder: 0,
      },
      {
        name: 'Livestock & Poultry',
        description:
          'Healthy livestock and poultry rearing supported by consistent farm care.',
        sortOrder: 1,
      },
      {
        name: 'Animal Feed',
        description:
          'Balanced feed production to support livestock growth and farm productivity.',
        sortOrder: 2,
      },
      {
        name: 'Agri-Trade & Distribution',
        description:
          'Supply support across Greater Accra through trade, logistics, and distribution.',
        sortOrder: 3,
      },
    ];
    const seeded = await this.categoryRepository.save(categories);
    await this.productRepository.save([
      {
        categoryId: seeded[0].id,
        name: 'Maize, cassava, and vegetables',
        description: 'Quality produce for households and local markets.',
        sortOrder: 0,
      },
      {
        categoryId: seeded[1].id,
        name: 'Broilers, layers, and small ruminants',
        description: 'Well-managed livestock and poultry production.',
        sortOrder: 0,
      },
      {
        categoryId: seeded[2].id,
        name: 'Feed formulation & supply',
        description: 'Balanced feed mixes for healthy growth.',
        sortOrder: 0,
      },
      {
        categoryId: seeded[3].id,
        name: 'Bulk supply & distribution',
        description: 'Reliable delivery across Accra and beyond.',
        sortOrder: 0,
      },
    ]);
  }
}
