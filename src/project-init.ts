import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

export const agentInstructions = `# Working on this August project

Start in main.aug. It shows the imports, dependency bindings, and application startup.
Read the adjacent .aug.md specification before changing a source file. Generate missing
or stale explanations with aug spec; they describe checked behavior and link dependencies.

Keep tests in the file that declares the behavior. Run aug check, aug test, and aug spec
after a change, and use aug run to compile and run the application. Run prepares required
source packages and native libraries. Commit aug.lock.json; do not edit .aug-packages.

For a supported standalone operation change, use aug context and the checked change
protocol. Keep the ordered request and independently authored acceptance cases together.
Read coverage.requiredContextComplete; unresolved or stale context cannot authorize edits.
Generated specs describe the starting program and are read only in the agent exchange.
Use source units for replacements. Keep a rejected candidate with its own diagnostics.

Use labeled inputs, narrow export.aug files, and underscore-prefixed private helpers.
Leave return types, effects, and errors to inference when an executable body provides
the answer. Bodyless interfaces still declare their contracts. Use borrow for mutation,
and keep unsafe native calls inside small adapters. Explain intent in Javadoc when it
is not evident from the code. Follow the existing indentation or brace style.

Language guide: https://greenpandastudios.github.io/augscript/
`;

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

/** Create a small, runnable application without replacing existing files. */
export function initProject(destination: string, template: 'hello' | 'weather' = 'hello'): string {
  const root = resolve(destination);
  if (existsSync(root) && readdirSync(root).length)
    throw new Error(`Directory is not empty: ${root}`);
  const name = basename(root);
  mkdirSync(root, { recursive: true });
  const files: Record<string, string> = {
    'AGENTS.md': agentInstructions,
    'main.aug': `import Greeter and SimpleGreeter from greeting\n\nimplement Greeter with SimpleGreeter\nresolve Greeter to greeter\nprint(value=greeter.greet(name="August"))\n`,
    'greeting.aug': `/** Build a greeting for a named person. */\ninterface Greeter:\n    /** Return a greeting for the named person. */\n    greet(string name) returns string\n\n/** A plain-language greeting. */\nSimpleGreeter() implements Greeter:\n    greet(string name):\n        return "Hello, " + name + "!"\n\ntest SimpleGreeter greeter:\n    when greetings:\n        greeter = SimpleGreeter()\n        it greets_a_person:\n            assert(greeter.greet(name="August") == "Hello, August!")\n`,
    '.gitignore': '.aug-build/\n.aug-changes/\n.aug-spec/\n.aug-packages/\n.aug-install-*/\n.aug-lock-*/\n.aug-write-*/\n.aug-add.json*\n*.aug.tmp\n*.aug.md\n',
    'README.md': `# ${name}\n\nThis is an August application. Start in \`main.aug\`; its dependencies and startup are visible there.\n\n\`greeting.aug\` contains a public interface, its implementation, and a same-file test.\n\n\`\`\`sh\naug run\naug check\naug test\naug spec\n\`\`\`\n\nFor the language guide, see https://GreenPandaStudios.github.io/augscript/getting-started.\n`,
  };
  if (template === 'weather') {
    delete files['greeting.aug'];
    files['main.aug'] = 'import weatherForecast from forecasts\n\nserve weatherForecast on port 8787\n';
    files['forecasts.aug'] = weatherSource;
    files['weather.http'] = '### Five simulated forecasts\nGET http://127.0.0.1:8787/weatherforecast\n\n### Generated OpenAPI document\nGET http://127.0.0.1:8787/openapi.json\n';
    files['main.yaml'] = 'block_style: indent\nopenapi:\n  enabled: true\n  title: "Weather forecast API"\n  version: "0.1.0"\n';
    files['README.md'] = `# ${name}\n\nA simulated weather API in August. Its endpoint, JSON record, and tests live in forecasts.aug.\n\nRun the server:\n\n\`\`\`sh\naug run\n\`\`\`\n\nOpen http://127.0.0.1:8787/weatherforecast for five forecasts, or http://127.0.0.1:8787/docs for the OpenAPI viewer. These are fixed examples, not live weather observations.\n\n\`\`\`sh\ncurl http://127.0.0.1:8787/weatherforecast\naug test\naug spec\n\`\`\`\n\nGuide: https://greenpandastudios.github.io/augscript/weather-api\n`;
  }
  for (const [file, contents] of Object.entries(files)) writeFileSync(join(root, file), contents, { flag: 'wx' });
  return root;
}
