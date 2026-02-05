import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMemberEntity } from './team-member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMemberEntity)
    private readonly teamRepository: Repository<TeamMemberEntity>,
  ) {}

  // Removed auto-seeding on module init
  // If you need to seed team members, use the admin panel

  async listMembers() {
    return this.teamRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async createMember(name: string, role: string, description: string) {
    if (!name || !role) {
      throw new BadRequestException('Name and role are required');
    }
    const count = await this.teamRepository.count();
    const member = this.teamRepository.create({
      name,
      role,
      description: description ?? '',
      imageUrl: '',
      sortOrder: count,
    });
    return this.teamRepository.save(member);
  }

  async updateMember(
    id: number,
    name: string,
    role: string,
    description: string,
  ) {
    if (!name || !role) {
      throw new BadRequestException('Name and role are required');
    }
    const member = await this.teamRepository.findOne({ where: { id } });
    if (!member) {
      throw new BadRequestException('Team member not found');
    }
    member.name = name;
    member.role = role;
    member.description = description ?? '';
    return this.teamRepository.save(member);
  }

  async updateImage(id: number, imageUrl: string) {
    const member = await this.teamRepository.findOne({ where: { id } });
    if (!member) {
      throw new BadRequestException('Team member not found');
    }
    member.imageUrl = imageUrl ?? '';
    return this.teamRepository.save(member);
  }

  async deleteMember(id: number) {
    await this.teamRepository.delete({ id });
  }
}
