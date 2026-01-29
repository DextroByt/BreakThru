import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export async function GET() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(data || '{}'));
    } catch (error) {
        // If file doesn't exist yet, return empty object
        return NextResponse.json({});
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await fs.writeFile(DB_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DB Write Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
