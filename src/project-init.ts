import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

/** Create a small, runnable application without replacing existing files. */
export function initProject(destination: string): string {
  const root = resolve(destination);
  if (existsSync(root) && readdirSync(root).length)
    throw new Error(`Directory is not empty: ${root}`);
  const name = basename(root);
  mkdirSync(root, { recursive: true });
  const files: Record<string, string> = {
    'main.aug': `import Greeter and SimpleGreeter from greeting\n\nimplement Greeter with SimpleGreeter\nresolve Greeter to greeter\nprint(value=greeter.greet(name="August"))\n`,
    'greeting.aug': `/** Build a greeting for a named person. */\ninterface Greeter:\n    /** Return a greeting for the named person. */\n    greet(string name) returns string\n\n/** A plain-language greeting. */\nSimpleGreeter() implements Greeter:\n    greet(string name):\n        return "Hello, " + name + "!"\n\ntest SimpleGreeter greeter:\n    when greetings:\n        greeter = SimpleGreeter()\n        it greets_a_person:\n            assert(greeter.greet(name="August") == "Hello, August!")\n`,
    '.gitignore': '.aug-build/\n.aug-spec/\n.aug-packages/\n.aug-install-*/\n*.aug.md\n',
    'README.md': `# ${name}\n\nThis is an August application. Start in \`main.aug\`; its dependencies and startup are visible there.\n\n\`greeting.aug\` contains a public interface, its implementation, and a same-file test.\n\n\`\`\`sh\naug run\naug check\naug test\naug spec\n\`\`\`\n\nFor the language guide, see https://GreenPandaStudios.github.io/augscript/getting-started.\n`,
  };
  for (const [file, contents] of Object.entries(files)) writeFileSync(join(root, file), contents, { flag: 'wx' });
  return root;
}
