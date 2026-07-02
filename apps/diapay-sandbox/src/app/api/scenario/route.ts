import { NextResponse } from 'next/server';
import { getScenario, scenarios } from '../../../lib/scenarios';
export async function GET() { return NextResponse.json({ scenarios: scenarios.map(({ run, ...scenario }) => scenario) }); }
export async function POST(request: Request) { const { id } = await request.json(); const scenario = getScenario(id); if (!scenario) return NextResponse.json({ error: { code: 'SCENARIO_NOT_FOUND', message: 'Unknown sandbox scenario' } }, { status: 404 }); return NextResponse.json(await scenario.run()); }
