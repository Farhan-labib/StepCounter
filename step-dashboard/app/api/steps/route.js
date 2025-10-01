import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Step from "../../../models/step";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { timestamp, stepCount, userId } = body;

    if (!timestamp || stepCount == null) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0); // normalize to midnight to match "per day"

    const filter = {
      userId: userId || "user001",
      timestamp: date
    };

    const update = {
      $set: { stepCount }
    };

    const options = {
      upsert: true, // create if not exist
      new: true
    };

    const doc = await Step.findOneAndUpdate(filter, update, options);

    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const docs = await Step.find().sort({ timestamp: -1 }).limit(limit).lean();
    return NextResponse.json(docs, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
