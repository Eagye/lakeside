import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberEntity } from './team-member.entity';
import { TeamService } from './team.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity])],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
