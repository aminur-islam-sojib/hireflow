import { NextRequest, NextResponse } from "next/server";
import { type Filter, type Document } from "mongodb";
import { auth } from "@/lib/auth";
import { collections, connectDB, dbConnect, toObjectId } from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "date-desc";

  await connectDB();
  const jobsCollection = dbConnect(collections.JOBS);

  const query: Filter<Document> = {
    userId: toObjectId(session.user.id),
  };

  if (status && status !== "all") {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { company: { $regex: search, $options: "i" } },
      { position: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj: Record<string, 1 | -1> =
    sort === "date-asc"
      ? { createdAt: 1 }
      : sort === "company"
        ? { company: 1 }
        : sort === "status"
          ? { status: 1 }
          : { createdAt: -1 };

  const total = await jobsCollection.countDocuments(query);
  const jobs = await jobsCollection
    .find(query)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return NextResponse.json({ jobs, total, page, limit });
}
