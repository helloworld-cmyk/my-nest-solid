import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const addressResponseSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  address: true,
  isDefault: true,
} satisfies Prisma.UserAddressSelect;

@Injectable()
export class UserAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserAddressCreateInput) {
    return this.prisma.userAddress.create({
      data,
      select: addressResponseSelect,
    });
  }

  findByIdAndUser(id: string, userId: string) {
    return this.prisma.userAddress.findFirst({
      where: { id, userId },
      select: { id: true },
    });
  }

  findAllByUserId(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: addressResponseSelect,
    });
  }

  findFirstByUserId(userId: string) {
    return this.prisma.userAddress.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
  }

  update(id: string, data: Prisma.UserAddressUpdateInput) {
    return this.prisma.userAddress.update({
      where: { id },
      data,
      select: addressResponseSelect,
    });
  }

  delete(id: string) {
    return this.prisma.userAddress.delete({
      where: { id },
      select: addressResponseSelect,
    });
  }

  unsetDefaultForUser(userId: string) {
    return this.prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
