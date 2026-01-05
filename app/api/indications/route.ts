import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const orderBy = searchParams.get('orderBy') || 'name'; // name, totalTrials, activeTrials
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    if (category) {
      where.category = category;
    }
    
    // Build orderBy clause
    let orderByClause: any = {};
    if (orderBy === 'totalTrials') {
      orderByClause = { totalTrials: 'desc' };
    } else if (orderBy === 'activeTrials') {
      orderByClause = { activeTrials: 'desc' };
    } else {
      orderByClause = { name: 'asc' };
    }
    
    // Fetch indications
    const indications = await prisma.indication.findMany({
      where,
      orderBy: orderByClause,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        totalTrials: true,
        activeTrials: true,
        companiesCount: true,
        hasMarketInsight: true,
        hasDrugInsight: true,
        hasEpidemInsight: true,
        mostRecentYear: true,
        yearRange: true,
        totalReports: true,
      },
    });
    
    // Get total count
    const totalCount = await prisma.indication.count({ where });
    
    // Get categories with counts
    const categoriesData = await prisma.indication.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 20,
    });
    
    const categories = categoriesData.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
    
    return NextResponse.json({
      success: true,
      indications,
      totalCount,
      categories,
      pagination: {
        limit,
        offset,
        hasMore: offset + indications.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching indications:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch indications',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

