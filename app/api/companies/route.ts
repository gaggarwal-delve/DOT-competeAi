import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const therapyArea = searchParams.get('therapyArea') || '';

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { headquarters: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (therapyArea) {
      where.therapyAreas = {
        has: therapyArea,
      };
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            trials: true,
            newsItems: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { message: 'Failed to fetch companies', error: (error as Error).message },
      { status: 500 }
    );
  }
}

