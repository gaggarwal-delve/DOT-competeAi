import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { slug } = await params;
    
    // Fetch indication by slug
    const indication = await prisma.indication.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        totalTrials: true,
        activeTrials: true,
        companiesCount: true,
        reportTypes: true,
        marketSize: true,
        growthRate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!indication) {
      return NextResponse.json(
        {
          success: false,
          message: 'Indication not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      indication,
    });
  } catch (error: any) {
    console.error('Error fetching indication:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch indication',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

