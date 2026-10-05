import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import {formatSource, sourceStyle, styleConfiguration} from './source-style.ts';
import type {SourceStyle} from './formatter.ts';

function projectAgentInstructions(library:boolean):string {
  const entry=library?'Start in src/export.aug. It lists the public surface; follow its explicit exports to the declarations and same-file tests.':'Start in main.aug. It shows the imports, dependency bindings, and application startup.';
  const execution=library?'Import the library from a separate application and use aug run there. Keep library commands focused on aug check, aug test and aug spec.':'Use aug run to compile and run the application. Run prepares required source packages and native libraries.';
  return `# Working on this August project

${entry}
Read the adjacent .aug.md specification before changing a source file. Generate missing
or stale explanations with aug spec; they describe checked behavior and link dependencies.

Keep tests in the file that declares the behavior. Run aug check, aug test, and aug spec
after a change. ${execution}
Commit aug.lock.json; do not edit .aug-packages.

Use labeled inputs, narrow export.aug files, and underscore-prefixed private helpers.
Leave return types, effects, and errors to inference when an executable body provides
the answer. Bodyless interfaces still declare their contracts. Use borrow for mutation,
and keep unsafe native calls inside small adapters. Explain intent in Javadoc when it
is not evident from the code. Follow the existing indentation or brace style.

Language guide: https://greenpandastudios.github.io/augscript/
`;
}
export const agentInstructions=projectAgentInstructions(false);
export const libraryAgentInstructions=projectAgentInstructions(true);

export const weatherSource = `/** The JSON shape returned by the forecast endpoint. Temperatures use whole degrees. */
record WeatherForecast(string date, int temperatureC, int temperatureF, string summary)

/** Return five simulated forecasts. Fixed data keeps the example and its tests reproducible. */
endpoint GET "/weatherforecast" as weatherForecast():
    return [
        WeatherForecast(
            date="2026-01-01",
            temperatureC=0,
            temperatureF=32,
            summary="Freezing"
        ),
        WeatherForecast(
            date="2026-01-02",
            temperatureC=10,
            temperatureF=50,
            summary="Cool"
        ),
        WeatherForecast(
            date="2026-01-03",
            temperatureC=20,
            temperatureF=68,
            summary="Mild"
        ),
        WeatherForecast(
            date="2026-01-04",
            temperatureC=30,
            temperatureF=86,
            summary="Warm"
        ),
        WeatherForecast(
            date="2026-01-05",
            temperatureC=35,
            temperatureF=95,
            summary="Hot"
        )
    ]

test endpoint weatherForecast client:
    when forecasts:
        it returns_json:
            response = client.request(method="GET", path="/weatherforecast")
            assert(condition=response.status == 200)
        it rejects_other_methods:
            response = client.request(method="POST", path="/weatherforecast")
            assert(condition=response.status == 405)
`;

/** Create a checked-source starter in a new or empty directory. Source preferences default to indentation, four spaces and equals; no dependencies are installed. */
export function initProject(destination: string, template: 'hello' | 'weather' = 'hello', preferences: Partial<SourceStyle> = {}): string {
  const style = sourceStyle(preferences);
  if (!['hello', 'weather'].includes(template)) throw new Error('Unknown application template: ' + template);
  const root = resolve(destination);
  if (existsSync(root) && readdirSync(root).length)
    throw new Error(`Directory is not empty: ${root}`);
  const name = basename(root);
  const files: Record<string, string> = {
    'AGENTS.md': agentInstructions,
    'main.yaml': styleConfiguration(style),
    'main.aug': `import greet from greeting\n\nprint(value=greet(name="August"))\n`,
    'greeting.aug': `/** Return a greeting for the named person. */\ngreet(string name):\n    return "Hello, " + name + "!"\n\ntest greet:\n    when greetings:\n        it greets_a_person:\n            assert(greet(name="August") == "Hello, August!")\n`,
    '.gitignore': '.aug-build/\n.aug-changes/\n.aug-change-lock/\n.aug-write-*\n.aug-spec/\n.aug-packages/\n.aug-install-*/\n.aug-lock-*/\n.aug-write-*/\n.aug-add.json*\n*.aug.tmp\n*.aug.md\n',
    'README.md': `# ${name}\n\nThis is an August application. Start in \`main.aug\`; its dependencies and startup are visible there.\n\n\`greeting.aug\` contains a greeting function and its same-file test.\n\n\`\`\`sh\naug run\naug check\naug test\naug spec\n\`\`\`\n\nFor the language guide, see https://GreenPandaStudios.github.io/augscript/getting-started.\n`,
  };
  if (template === 'weather') {
    delete files['greeting.aug'];
    files['main.aug'] = 'import weatherForecast from forecasts\n\nserve weatherForecast on port 8787\n';
    files['forecasts.aug'] = weatherSource;
    files['weather.http'] = '### Five simulated forecasts\nGET http://127.0.0.1:8787/weatherforecast\n\n### Generated OpenAPI document\nGET http://127.0.0.1:8787/openapi.json\n';
    files['main.yaml'] += 'openapi:\n  enabled: true\n  title: "Weather forecast API"\n  version: "0.1.0"\n';
    files['README.md'] = `# ${name}\n\nA simulated weather API in August. Its endpoint, JSON record, and tests live in forecasts.aug.\n\nRun the server:\n\n\`\`\`sh\naug run\n\`\`\`\n\nOpen http://127.0.0.1:8787/weatherforecast for five forecasts, or http://127.0.0.1:8787/docs for the OpenAPI viewer. These are fixed examples, not live weather observations.\n\n\`\`\`sh\ncurl http://127.0.0.1:8787/weatherforecast\naug test\naug spec\n\`\`\`\n\nGuide: https://greenpandastudios.github.io/augscript/weather-api\n`;
  }
  for (const file of Object.keys(files).filter(file => file.endsWith('.aug')))
    files[file] = formatSource(join(root, file), files[file], style);
  mkdirSync(root, { recursive: true });
  for (const [file, contents] of Object.entries(files)) writeFileSync(join(root, file), contents, { flag: 'wx' });
  return root;
}
