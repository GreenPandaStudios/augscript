#!/usr/bin/env python3
"""Render the wiki's measured graphs and result tables from benchmark-results.json."""
import io
import json
from pathlib import Path
import statistics
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / 'docs/benchmark-results.json').read_text())
baseline = json.loads((ROOT / 'docs/benchmark-baseline.json').read_text())
# Keep the same-source migration reference in the raw report. The application
# charts compare August with independently written C, Node and Python programs.
for section in ['batch', 'http']:
    for workload in data[section]:
        workload['results'] = [item for item in workload['results'] if item['implementation'] != 'August (C backend)']
check = '--check' in sys.argv
outputs = {}
colors = {'August': '#087e8b', 'C': '#6c7789', 'Node': '#587f25', 'Python': '#9265b8'}
labels = {'startup': 'Startup', 'cpu': 'CPU · 2 million iterations', 'collections-20k': 'Map + Set · 20,000 entries',
          'collections-200k': 'Map + Set · 200,000 entries', 'json': 'JSON · 5,000 round trips'}
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'svg.hashsalt': 'august-benchmarks',
                     'axes.spines.top': False, 'axes.spines.right': False, 'axes.spines.left': False,
                     'axes.edgecolor': '#c4cbd2', 'text.color': '#263445', 'axes.labelcolor': '#263445',
                     'xtick.color': '#52606d', 'ytick.color': '#263445', 'savefig.facecolor': '#ffffff'})

def save(fig, filename, title, description):
    buffer = io.StringIO()
    fig.savefig(buffer, format='svg', metadata={'Date': None, 'Title': title, 'Description': description})
    svg = buffer.getvalue()
    start = svg.index('<svg ')
    svg = svg[:start] + svg[start:].replace('<svg ', '<svg role="img" aria-label="' + title + '" ', 1)
    svg = '\n'.join(line.rstrip() for line in svg.splitlines()) + '\n'
    outputs['docs/assets/benchmarks/' + filename + '.svg'] = svg
    # A local raster preview is convenient for inspection; the wiki uses sharp vector graphs.
    preview = ROOT / '.aug-build/benchmark-graphs'
    if not check:
        preview.mkdir(parents=True, exist_ok=True)
        fig.savefig(preview / (filename + '.png'), dpi=160)
    plt.close(fig)

fig, axes = plt.subplots(len(data['batch']), 1, figsize=(6, 12), layout='constrained')
for ax, workload in zip(axes, data['batch']):
    results = workload['results']
    names = [item['implementation'] for item in results]
    values = [item['milliseconds']['median'] for item in results]
    ax.barh(names, values, color=[colors[name] for name in names], height=.58)
    ax.invert_yaxis()
    ax.set_title(labels[workload['name']], loc='left', fontsize=12, fontweight='bold', pad=8)
    ax.set_xlim(0, max(values) * 1.24)
    ax.set_xlabel('Milliseconds · lower is faster', fontsize=10)
    ax.xaxis.grid(True, color='#e8edf1'); ax.set_axisbelow(True)
    ax.tick_params(axis='y', length=0)
    for index, value in enumerate(values):
        ax.text(value + max(values) * .025, index, f'{value:.2f}', va='center', fontsize=11,
                fontweight='bold' if names[index] == 'August' else 'normal')
save(fig, 'execution', 'Execution time by workload', f"Median wall time including process startup, {data['methodology']['iterations']} samples per implementation. Shorter bars are faster. Each panel has its own linear scale.")

fig, ax = plt.subplots(figsize=(6, 4), layout='constrained')
concurrency = [item['concurrency'] for item in data['http']]
for name, marker in [('August', 'o'), ('Node', 's')]:
    values, lows, highs = [], [], []
    for workload in data['http']:
        result = next(item for item in workload['results'] if item['implementation'] == name)
        measured = result['requestsPerSecond']
        values.append(measured['median'] / 1000)
        lows.append((measured['median'] - min(measured['samples'])) / 1000)
        highs.append((max(measured['samples']) - measured['median']) / 1000)
    ax.errorbar(concurrency, values, yerr=[lows, highs], label=name, color=colors[name], marker=marker,
                linewidth=2, markersize=7, capsize=4)
    for x, value in zip(concurrency, values):
        workload = next(item for item in data['http'] if item['concurrency'] == x)
        other = next(item for item in workload['results'] if item['implementation'] != name)
        offset = 9 if value >= other['requestsPerSecond']['median'] / 1000 else -19
        ax.annotate(f'{value:.1f}k', (x, value), xytext=(0, offset), color=colors[name],
                    textcoords='offset points', ha='center', fontsize=10)
ax.set_title('HTTP · typed JSON response', loc='left', fontweight='bold', pad=12)
ax.set_xlabel('Concurrent keep-alive clients'); ax.set_ylabel('Thousands of requests/sec · higher is faster')
ax.set_xticks(concurrency); ax.set_xlim(-3, 70)
ax.set_ylim(0, max(item['requestsPerSecond']['median'] for workload in data['http'] for item in workload['results']) / 1000 * 1.3)
ax.grid(True, color='#e8edf1'); ax.legend(frameon=False, loc='upper left')
save(fig, 'http', 'HTTP throughput at three concurrency levels', f"Median of {data['methodology']['httpRounds']} {data['methodology']['requestsPerRound']}-request rounds. Error bars show the observed minimum and maximum, not confidence intervals.")

fig, axes = plt.subplots(2, 1, figsize=(6, 5), layout='constrained')
for ax, key in zip(axes, ['collections-20k', 'collections-200k']):
    workload = next(item for item in data['batch'] if item['name'] == key)
    names = [item['implementation'] for item in workload['results']]
    values = [item['peakRssBytes']['median'] / 1048576 for item in workload['results']]
    ax.barh(names, values, color=[colors[name] for name in names], height=.58); ax.invert_yaxis()
    ax.set_title(labels[key], loc='left', fontsize=12, fontweight='bold', pad=8)
    ax.set_xlabel('Peak process memory in MiB · lower uses less memory', fontsize=10)
    ax.set_xlim(0, max(values) * 1.24); ax.xaxis.grid(True, color='#e8edf1'); ax.set_axisbelow(True)
    ax.tick_params(axis='y', length=0)
    for index, value in enumerate(values):
        ax.text(value + max(values) * .025, index, f'{value:.1f}', va='center')
save(fig, 'memory', 'Peak memory for two collection sizes', 'Median of three separate peak RSS measurements, including interpreter and runtime. This measures total process memory, not only the collection payload.')

def result(report, section, key, implementation='August'):
    field = 'name' if section == 'batch' else 'concurrency'
    workload = next(item for item in report[section] if item[field] == key)
    return next(item for item in workload['results'] if item['implementation'] == implementation)

fig, axes = plt.subplots(2, 1, figsize=(6, 7), layout='constrained')
keys = ['cpu', 'collections-20k', 'collections-200k']
for report, name, offset, color in [(baseline, 'Before', -.18, '#8a96a3'), (data, 'Current', .18, colors['August'])]:
    values = [result(report, 'batch', key)['milliseconds']['median'] for key in keys]
    positions = [index + offset for index in range(len(keys))]
    axes[0].barh(positions, values, height=.32, label=name, color=color)
    for position, value in zip(positions, values):
        axes[0].text(value + .7, position, f'{value:.2f}', va='center', fontsize=10)
axes[0].set_yticks(range(len(keys)), ['CPU · 2M steps', 'Map + Set · 20k', 'Map + Set · 200k'])
axes[0].invert_yaxis(); axes[0].tick_params(axis='y', length=0)
axes[0].set_xlim(0, max(result(baseline, 'batch', key)['milliseconds']['median'] for key in keys) * 1.2)
axes[0].set_xlabel('Milliseconds · lower is faster'); axes[0].set_title('August execution · same programs', loc='left', fontweight='bold')
axes[0].xaxis.grid(True, color='#e8edf1'); axes[0].set_axisbelow(True); axes[0].legend(frameon=False)
for report, name, color, style in [(baseline, 'Before', '#8a96a3', '--'), (data, 'Current', colors['August'], '-')]:
    values = [result(report, 'http', key)['requestsPerSecond']['median'] / 1000 for key in concurrency]
    axes[1].plot(concurrency, values, color=color, marker='o', linestyle=style, linewidth=2, label=name)
    for x, value in zip(concurrency, values):
        other = data if name == 'Before' else baseline
        offset = 9 if value >= result(other, 'http', x)['requestsPerSecond']['median'] / 1000 else -19
        axes[1].annotate(f'{value:.1f}k', (x, value), xytext=(0, offset), color=color,
                         textcoords='offset points', ha='center', fontsize=10)
axes[1].set_xticks(concurrency); axes[1].set_xlim(-3, 70)
axes[1].set_ylim(0, max(result(report, 'http', key)['requestsPerSecond']['median'] for report in [data, baseline] for key in concurrency) / 1000 * 1.3)
axes[1].set_xlabel('Concurrent keep-alive clients'); axes[1].set_ylabel('Thousands of requests/sec · higher is faster')
axes[1].set_title('August HTTP · same JSON endpoint', loc='left', fontweight='bold')
axes[1].grid(True, color='#e8edf1'); axes[1].legend(frameon=False)
save(fig, 'improvements', 'Earlier and current August performance', 'Historical measurements of the same CPU, Map/Set and HTTP programs on this host. Compiler versions and backends differ; current HTTP measurements use five rounds instead of three. Lower execution time and higher throughput are faster.')

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
improvement_rows = ['| August workload | Before | Current | Current relative to before |', '| --- | ---: | ---: | ---: |']
for key in keys:
    before = result(baseline, 'batch', key)['milliseconds']['median']
    current = result(data, 'batch', key)['milliseconds']['median']
    improvement_rows.append(f'| {labels[key]} | {before:.2f} ms | {current:.2f} ms | {before / current:.2f}× faster |')
for key in concurrency:
    before = result(baseline, 'http', key)['requestsPerSecond']['median']
    current = result(data, 'http', key)['requestsPerSecond']['median']
    improvement_rows.append(f'| HTTP · {key} clients | {before:,.0f} req/sec | {current:,.0f} req/sec | {current / before:.2f}× throughput |')
before = result(baseline, 'batch', 'collections-200k')['peakRssBytes']['median'] / 1048576
current = result(data, 'batch', 'collections-200k')['peakRssBytes']['median'] / 1048576
improvement_rows.append(f'| Map + Set · 200k peak memory | {before:.1f} MiB | {current:.1f} MiB | {100 * (1-current/before):.0f}% less |')
cpu = result(data, 'batch', 'cpu')['milliseconds']['median']
c = result(data, 'batch', 'cpu', 'C')['milliseconds']['median']
summary = [f'The CPU program takes **{cpu:.2f} ms** in August and **{c:.2f} ms** in C on this host. The large-collection program takes **{result(data, "batch", "collections-200k")["milliseconds"]["median"]:.2f} ms** in August. These are measurements of the shown programs, not guarantees for other applications. JSON batch time includes interpreter startup for Node and Python; it does not establish a universal JSON-throughput advantage.']
blocks = [('execution', batch_rows), ('http', http_rows), ('memory', memory_rows), ('improvements', improvement_rows), ('summary', summary)]
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
        if not path.exists() or path.read_text() != content: raise SystemExit('Stale benchmark graph/table: ' + name)
    else:
        path.parent.mkdir(parents=True, exist_ok=True); path.write_text(content)
print(str(len(outputs)) + (' benchmark artifacts match data' if check else ' benchmark artifacts rendered'))
