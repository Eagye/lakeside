import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchEntity } from './branch.entity';

export interface CreateBranchDto {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
  ) {}

  async createBranch(data: CreateBranchDto): Promise<BranchEntity> {
    const branch = this.branchRepository.create(data);
    return await this.branchRepository.save(branch);
  }

  async listBranches(): Promise<BranchEntity[]> {
    return await this.branchRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async listActiveBranches(): Promise<BranchEntity[]> {
    return await this.branchRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getBranchById(id: number): Promise<BranchEntity | null> {
    return await this.branchRepository.findOne({ where: { id } });
  }

  async updateBranch(
    id: number,
    data: UpdateBranchDto,
  ): Promise<BranchEntity | null> {
    const branch = await this.getBranchById(id);
    if (!branch) {
      return null;
    }

    Object.assign(branch, data);
    branch.updatedAt = new Date();
    return await this.branchRepository.save(branch);
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await this.branchRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async initializeDefaultBranches(): Promise<void> {
    const count = await this.branchRepository.count();
    if (count === 0) {
      const defaultBranches: CreateBranchDto[] = [
        {
          name: 'Ofankor - Headquarters',
          address: 'P.O.BOX 236 Ofankor-Accra, Greater Accra Region',
          latitude: 5.6809,
          longitude: -0.2420,
          displayOrder: 0,
          description: 'Lakeside Farms - Main Office and Headquarters',
          phone: '+233 543 024 779',
        },
        {
          name: 'Tamale - Kumbugu',
          address: 'Kumbugu, Tamale, Northern Region',
          latitude: 9.4034,
          longitude: -0.8424,
          displayOrder: 1,
          description: 'Lakeside Farms - Tamale Kumbugu Branch',
        },
        {
          name: 'Nsawam Adoagyire',
          address: 'Adoagyire, Nsawam, Eastern Region',
          latitude: 5.8081,
          longitude: -0.3522,
          displayOrder: 2,
          description: 'Lakeside Farms - Nsawam Adoagyire Branch',
        },
        {
          name: 'Kwahu Tafo',
          address: 'Tafo, Kwahu, Eastern Region',
          latitude: 6.3167,
          longitude: -0.6333,
          displayOrder: 3,
          description: 'Lakeside Farms - Kwahu Tafo Branch',
        },
        {
          name: 'Tamale - Kamina',
          address: 'Kamina, Tamale, Northern Region',
          latitude: 9.4100,
          longitude: -0.8000,
          displayOrder: 4,
          description: 'Lakeside Farms - Tamale Kamina Branch',
        },
      ];

      for (const branch of defaultBranches) {
        await this.createBranch(branch);
      }
    }
  }
}
