import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { level, source, action, payload, status } = body;

        // ANSI Color codes for professional terminal output
        const colors = {
            reset: "\x1b[0m",
            bright: "\x1b[1m",
            dim: "\x1b[2m",
            blue: "\x1b[34m",
            cyan: "\x1b[36m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            red: "\x1b[31m",
            magenta: "\x1b[35m"
        };

        const timestamp = new Date().toLocaleTimeString();
        const icon = status === 'error' ? '❌' : '⚡';
        const statusColor = status === 'error' ? colors.red : colors.green;

        // Professional Log Format
        console.log(`\n${colors.dim}[${timestamp}]${colors.reset} ${colors.bright}${colors.cyan}[TELEMETRY]${colors.reset} ${statusColor}${icon} ${action}${colors.reset}`);
        console.log(`${colors.dim}  Source: ${colors.reset}${colors.magenta}${source}${colors.reset}`);

        if (payload && Object.keys(payload).length > 0) {
            console.log(`${colors.dim}  Payload: ${colors.reset}${colors.yellow}${JSON.stringify(payload, null, 2).replace(/\n/g, '\n  ')}${colors.reset}`);
        }

        console.log(`${colors.dim}  --------------------------------------------------${colors.reset}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
