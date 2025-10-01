import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StepData from '@/models/StepData';


export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { timestamp, stepCount, userId } = body;


    if (!timestamp || stepCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

 
    const stepData = await StepData.create({
      timestamp,
      stepCount,
      userId: userId || 'user001'
    });

    return NextResponse.json(
      { success: true, data: stepData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving step data:', error);
    return NextResponse.json(
      { error: 'Failed to save step data' },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user001';
    const hours = parseInt(searchParams.get('hours')) || 24;

   
    const timeAgo = Date.now() - (hours * 60 * 60 * 1000);

   
    const stepData = await StepData.find({
      userId: userId,
      timestamp: { $gte: timeAgo }
    })
    .sort({ timestamp: 1 })
    .limit(1000);

    return NextResponse.json(
      { success: true, data: stepData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching step data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch step data' },
      { status: 500 }
    );
  }
}