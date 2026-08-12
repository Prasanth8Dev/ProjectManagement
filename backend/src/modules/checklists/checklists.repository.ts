import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChecklistsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTaskId(taskId: string) {
    return this.prisma.checklistItem.findMany({
      where: { taskId },
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.checklistItem.findUnique({ where: { id } });
  }

  async create(data: Prisma.ChecklistItemCreateInput) {
    return this.prisma.checklistItem.create({ data });
  }

  async update(id: string, data: Prisma.ChecklistItemUpdateInput) {
    return this.prisma.checklistItem.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.checklistItem.delete({ where: { id } });
  }

  async getMaxPosition(taskId: string): Promise<number> {
    const result = await this.prisma.checklistItem.aggregate({
      where: { taskId },
      _max: { position: true },
    });
    return result._max.position ?? 0;
  }

  async reorder(items: Array<{ id: string; position: number }>) {
    await Promise.all(
      items.map((item) =>
        this.prisma.checklistItem.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );
  }
}
