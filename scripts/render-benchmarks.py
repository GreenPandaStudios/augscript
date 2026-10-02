#!/usr/bin/env python3
"""Render measured wiki tables and source examples from the raw reports."""
import json
from pathlib import Path
import statistics
import sys

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / 'docs/benchmark-results.json').read_text())
for section in ['batch', 'http']:
    for workload in data[section]:
        workload['results'] = [item for item in workload['results'] if item['implementation'] != 'August (C backend)']
check = '--check' in sys.argv
outputs = {}
labels = {'startup': 'Startup', 'cpu': 'CPU · 2 million iterations', 'collections-20k': 'Map + Set · 20,000 entries',
          'collections-200k': 'Map + Set · 200,000 entries', 'json': 'JSON · 5,000 round trips'}

def result(report, section, key, implementation='August'):
    field = 'name' if section == 'batch' else 'concurrency'
    workload = next(item for item in report[section] if item[field] == key)
    return next(item for item in workload['results'] if item['implementation'] == implementation)

batch_rows = ['| Workload | August | C | Node | Python |', '| --- | ---: | ---: | ---: | ---: |']
memory_rows = ['| Workload | August | C | Node | Python |', '| --- | ---: | ---: | ---: | ---: |']
for workload in data['batch']:
    batch_rows.append('| ' + labels[workload['name']] + ' | ' + ' | '.join(f"{item['milliseconds']['median']:.2f} ms" for item in workload['results']) + ' |')
    memory_rows.append('| ' + labels[workload['name']] + ' | ' + ' | '.join(f"{item['peakRssBytes']['median'] / 1048576:.1f} MiB" for item in workload['results']) + ' |')
http_rows = ['| Clients | August req/sec | Node req/sec | August p95 latency | Node p95 latency |', '| ---: | ---: | ---: | ---: | ---: |']
for workload in data['http']:
    results = workload['results']
    rates = [f"{round(item['requestsPerSecond']['median']):,}" for item in results]
    latency = [f"{statistics.median(run['latencyMs']['p95'] for run in item['rounds']):.2f} ms" for item in results]
    http_rows.append('| ' + str(workload['concurrency']) + ' | ' + ' | '.join(rates + latency) + ' |')
page = (ROOT / 'docs/performance.md').read_text()
cpu = result(data, 'batch', 'cpu')['milliseconds']['median']
c = result(data, 'batch', 'cpu', 'C')['milliseconds']['median']
summary = [f'The CPU program takes **{cpu:.2f} ms** in August and **{c:.2f} ms** in C on this host. The large-collection program takes **{result(data, "batch", "collections-200k")["milliseconds"]["median"]:.2f} ms** in August. These are measurements of the shown programs, not guarantees for other applications. JSON batch time includes interpreter startup for Node and Python; it does not establish a universal JSON-throughput advantage.']
blocks = [('execution', batch_rows), ('http', http_rows), ('memory', memory_rows), ('summary', summary)]
projects = {
    'startup': [('benchmarks/startup/main.aug', 'main.aug')],
    'cpu': [('benchmarks/cpu/main.aug', 'main.aug')],
    'collections': [('benchmarks/collections/main.aug', 'main.aug')],
    'json': [('benchmarks/json/data.aug', 'data.aug'), ('benchmarks/json/main.aug', 'main.aug')],
    'http': [('benchmarks/http/routes.aug', 'routes.aug'), ('benchmarks/http/main.aug', 'main.aug')],
}
for name, files in projects.items():
    source = []
    for path, filename in files:
        source.extend([f'**{filename}**', '', f'```aug project=benchmark-{name} file={filename}', (ROOT / path).read_text().rstrip(), '```', ''])
    configuration = ROOT / f'benchmarks/{name}/main.yaml'
    if configuration.exists():
        source.extend(['**main.yaml**', '', f'```yaml project=benchmark-{name} file=main.yaml', configuration.read_text().rstrip(), '```', ''])
    blocks.append(('source-' + name, source))
for name, path, language in [('load', 'scripts/http-load.mjs', 'js'), ('c', 'benchmarks/reference.c', 'c'),
                              ('node', 'benchmarks/reference.mjs', 'js'), ('python', 'benchmarks/reference.py', 'python')]:
    blocks.append(('source-' + name, [f'```{language}', (ROOT / path).read_text().rstrip(), '```']))
for name, rows in blocks:
    start, end = '[benchmark-' + name + '-start]: #', '[benchmark-' + name + '-end]: #'
    before, rest = page.split(start, 1); _, after = rest.split(end, 1)
    page = before + start + '\n\n' + '\n'.join(rows) + '\n\n' + end + after
outputs['docs/performance.md'] = page
for name, content in outputs.items():
    path = ROOT / name
    if check:
        if not path.exists() or path.read_text() != content: raise SystemExit('Stale benchmark table: ' + name)
    else:
        path.parent.mkdir(parents=True, exist_ok=True); path.write_text(content)
print(str(len(outputs)) + (' benchmark table/source artifacts match data' if check else ' benchmark table/source artifacts rendered'))
