import type { Expr, Span } from './ast.ts';
import type { Ty } from './types.ts';

export type Origins = ReadonlySet<string>;
export const unionOrigins = (...sets: Origins[]): Origins => new Set(sets.flatMap(set => [...set]));
export const overlap = (left: Origins, right: Origins): boolean => [...left].some(origin => right.has(origin));
export const allocationOrigin = (span: Span): Origins => new Set([`new:${span.file}:${span.start}`]);

interface Place { origins: Origins; readonly: boolean; parent?: string; grant?: string; external?: string }
interface Loan { origins: Origins; implicit: boolean; outerNames: Set<string> }
interface HeapField { origins: Origins; mutable: boolean }

/** Stable object origins survive rebinding; loans and branch joins stay private. */
export class OwnershipFlow {
  private places = new Map<string, Place>();
  private loans = new Map<string, Loan>();
  private borrowedInputs = new Set<string>();
  private heap = new Map<string, Map<string, HeapField>>();
  private regions: { origins: Origins; outerNames: Set<string> }[] = [];
  private frozenOrigins = new Set<string>();
  private taskLoans = new Map<string, {origins: Origins; exclusive: boolean; scope: string; repeated: boolean}>();
  private tasks = new Map<string, {scope: string; errors: Ty[]; observed: boolean}>();

  clone(): OwnershipFlow {
    const copy = new OwnershipFlow();
    copy.places = new Map([...this.places].map(([name, place]) => [name, { ...place }]));
    copy.loans = new Map(this.loans);
    copy.borrowedInputs = new Set(this.borrowedInputs);
    copy.heap = new Map([...this.heap].map(([origin, fields]) => [origin, new Map(fields)]));
    copy.regions = [...this.regions];
    copy.frozenOrigins = new Set(this.frozenOrigins);
    copy.taskLoans = new Map(this.taskLoans);
    copy.tasks = new Map(this.tasks);
    return copy;
  }

  origins(name: string): Origins { return this.places.get(name)?.origins ?? new Set(); }
  frozen(origins: Origins): boolean { return overlap(origins, this.frozenOrigins); }
  freeze(origins: Origins, span: Span, report: (span: Span, message: string) => void): void {
    const reachable = this.reachable(origins);
    if ([...this.loans.values()].some(loan => overlap(loan.origins, reachable))) report(span, 'Cannot freeze an active mutable borrow');
    for (const origin of reachable) this.frozenOrigins.add(origin);
    for (const place of this.places.values()) if (overlap(this.reachable(place.origins), reachable)) place.readonly = true;
  }
  external(name: string): string | undefined { return this.places.get(name)?.external; }
  region(origins: Origins): void { this.regions.push({ origins, outerNames: new Set(this.places.keys()) }); }

  captureTask(task: string, scope: string, origins: Origins, exclusive: boolean, repeated: boolean, span: Span,
    report: (span: Span, message: string) => void): void {
    const reachable = this.reachable(origins);
    for (const loan of this.taskLoans.values()) if ((exclusive || loan.exclusive) && overlap(reachable, loan.origins))
      report(span, 'Task captures overlap an active task with mutable access');
    const previous = this.taskLoans.get(task);
    this.taskLoans.set(task, {scope, origins:unionOrigins(previous?.origins ?? new Set(), reachable),
      exclusive:exclusive || !!previous?.exclusive, repeated:repeated || !!previous?.repeated});
  }
  waitTasks(origins: Origins, all: boolean): void {
    const reachable = this.reachable(origins);
    const matches = [...this.tasks.keys()].filter(task => reachable.has(task));
    // A Task<T> read from an indexed collection or branch may have several
    // possible origins. Only a List<Task<T>> wait joins every matching child.
    if (!all && matches.length !== 1) return;
    // A static start site in a loop can represent several live children. Waiting for
    // one result cannot prove that earlier children from that site have finished.
    for (const task of matches) {
      if (!this.taskLoans.get(task)?.repeated) this.taskLoans.delete(task);
      const value = this.tasks.get(task)!;
      this.tasks.set(task, {...value, observed: true});
    }
  }
  registerTask(task: string, scope: string, errors: Ty[]): void {
    this.tasks.set(task, {scope, errors, observed: false});
  }
  taskErrors(origins: Origins): Ty[] | undefined {
    const found = [...this.reachable(origins)].flatMap(origin => this.tasks.has(origin) ? [this.tasks.get(origin)!] : []);
    const scopes = new Set(found.map(task => task.scope));
    return found.length ? [...found, ...[...this.tasks.values()].filter(task => !task.observed && scopes.has(task.scope))].flatMap(task => task.errors) : undefined;
  }
  hasTaskCapture(origins: Origins): boolean {
    const reachable = this.reachable(origins);
    return [...this.taskLoans.values()].some(loan => overlap(loan.origins, reachable));
  }
  pendingTaskErrors(scope?: string): Ty[] {
    return [...this.tasks.values()].filter(task => !task.observed && (!scope || task.scope === scope)).flatMap(task => task.errors);
  }
  joinTasks(scope: string): void {
    for (const [task, loan] of this.taskLoans) if (loan.scope === scope) this.taskLoans.delete(task);
    for (const [task, value] of this.tasks) if (value.scope === scope) this.tasks.delete(task);
  }

  object(origins: Origins, fields: { name: string; origins: Origins; mutable: boolean }[]): void {
    for (const origin of origins) {
      const stored = this.heap.get(origin) ?? new Map<string, HeapField>();
      for (const field of fields) stored.set(field.name, { origins: unionOrigins(stored.get(field.name)?.origins ?? new Set(), field.origins),
        mutable: field.mutable || !!stored.get(field.name)?.mutable });
      this.heap.set(origin, stored);
    }
  }

  field(origins: Origins, name?: string): Origins {
    return unionOrigins(...[...origins].map(origin => {
      const fields = this.heap.get(origin);
      if (!fields) return new Set([origin]);
      return name === undefined ? unionOrigins(...[...fields.values()].map(field => field.origins)) : fields.get(name)?.origins ?? new Set([origin]);
    }));
  }

  reachable(origins: Origins, mutableOnly = false): Origins {
    const output = new Set(origins);
    for (const origin of output) for (const field of this.heap.get(origin)?.values() ?? [])
      if (!mutableOnly || field.mutable) for (const child of field.origins) output.add(child);
    return output;
  }

  declare(name: string, origins: Origins, readonly: boolean, options: {
    parent?: string; source?: string; external?: string; borrowedInput?: boolean;
  } = {}): void {
    const source = options.source ? this.places.get(options.source) : undefined;
    const grant = options.source ? this.activeGrant(options.source) : undefined;
    this.places.set(name, { origins, readonly: readonly || !!source?.readonly || this.frozen(origins),
      parent: options.parent, grant, external: options.external ?? source?.external });
    if (options.borrowedInput) for (const origin of origins) this.borrowedInputs.add(origin);
  }

  rebind(name: string, origins: Origins, readonly: boolean, span: Span,
    report: (span: Span, message: string) => void, source?: string): void {
    const place = this.places.get(name);
    if (place && !place.parent && [...this.loans.values()].some(loan => overlap(loan.origins, this.reachable(place.origins, true))))
      report(span, `Cannot rebind ${name} while its object is borrowed`);
    if ([...this.loans.values()].some(loan => loan.outerNames.has(name) && overlap(loan.origins, this.reachable(origins))))
      report(span, `A borrowed reference cannot escape into outer variable ${name}`);
    if (this.regions.some(region => region.outerNames.has(name) && overlap(region.origins, this.reachable(origins))))
      report(span, `A scoped reference cannot escape into outer variable ${name}`);
    this.declare(name, origins, readonly, { source, external: place?.parent ? place.external : undefined, parent: place?.parent });
  }

  read(name: string, span: Span, report: (span: Span, message: string) => void): void {
    const place = this.places.get(name);
    if (!place) return;
    if (![...place.origins].some(origin => this.taskLoans.has(origin)) &&
        [...this.taskLoans.values()].some(loan => loan.exclusive && overlap(loan.origins, this.reachable(place.origins))))
      report(span, `Cannot read ${name} while a task has mutable access; wait for the task first`);
    for (const [borrower, loan] of this.loans) {
      if (overlap(loan.origins, this.reachable(place.origins)) && name !== borrower && place.grant !== borrower && place.parent !== borrower)
        report(span, `Cannot read ${name} while alias ${borrower} is mutably borrowed`);
    }
  }

  borrow(name: string, span: Span, report: (span: Span, message: string) => void, implicit = false): void {
    const place = this.places.get(name);
    if (!place) return;
    if (place.readonly) report(span, `Cannot mutably borrow read-only ${name}`);
    const reachable = this.reachable(place.origins, true);
    if ([...this.taskLoans.values()].some(loan => overlap(loan.origins, reachable)))
      report(span, `Cannot borrow ${name} while a task uses it; wait for the task first`);
    for (const [other, loan] of this.loans) if (overlap(loan.origins, reachable) &&
      !(loan.implicit && (other === name || place.parent === other || place.grant === other)))
      report(span, `${name} aliases active exclusive borrow ${other}`);
    this.loans.set(name, { origins: reachable, implicit, outerNames: new Set(this.places.keys()) });
  }

  activeGrant(name: string): string | undefined {
    const place = this.places.get(name);
    if (this.loans.has(name)) return name;
    if (place?.grant && this.loans.has(place.grant)) return place.grant;
    if (place?.parent && this.loans.has(place.parent)) return place.parent;
    return undefined;
  }

  assertMove(name: string, span: Span, report: (span: Span, message: string) => void): void {
    const place = this.places.get(name);
    if (place && [...this.loans.values()].some(loan => overlap(loan.origins, this.reachable(place.origins, true))))
      report(span, `Cannot move ${name} while it is borrowed`);
    if (place && this.hasTaskCapture(place.origins))
      report(span, `Cannot move ${name} while a task uses it; wait for the task first`);
  }

  escape(origins: Origins, span: Span, report: (span: Span, message: string) => void, scoped = true, immutable = false): void {
    if (immutable) return;
    const reachable = this.reachable(origins);
    if ([...reachable].some(origin => this.borrowedInputs.has(origin)) ||
      [...this.loans.values()].some(loan => overlap(loan.origins, reachable)))
      report(span, 'A borrowed reference cannot escape into storage or a return value');
    if (scoped && this.regions.some(region => overlap(region.origins, reachable))) report(span, 'A scoped reference cannot escape its composition scope');
  }

  assertDistinct(arguments_: { origins: Origins; exclusive: boolean; span: Span }[],
    report: (span: Span, message: string) => void): void {
    arguments_.forEach((argument, index) => {
      for (const other of arguments_.slice(0, index)) if ((argument.exclusive || other.exclusive) &&
        overlap(this.reachable(argument.origins, argument.exclusive), this.reachable(other.origins, other.exclusive)))
        report(argument.span, 'An exclusive argument aliases another argument in this call');
    });
  }

  join(branches: OwnershipFlow[]): void {
    this.taskLoans = new Map(branches.flatMap(branch => [...branch.taskLoans]));
    this.tasks = new Map([...new Set(branches.flatMap(branch => [...branch.tasks.keys()]))].map(task => {
      const values = branches.flatMap(branch => branch.tasks.has(task) ? [branch.tasks.get(task)!] : []);
      return [task, {...values[0], errors: values.flatMap(value => value.errors), observed: values.every(value => value.observed)}];
    }));
    for (const branch of branches) for (const origin of branch.frozenOrigins) this.frozenOrigins.add(origin);
    for (const branch of branches) for (const [origin, fields] of branch.heap) {
      const current = this.heap.get(origin) ?? new Map<string, HeapField>();
      for (const [name, field] of fields) current.set(name, {
        origins: unionOrigins(current.get(name)?.origins ?? new Set(), field.origins),
        mutable: field.mutable || !!current.get(name)?.mutable,
      });
      this.heap.set(origin, current);
    }
    for (const [name, place] of this.places) {
      const versions = branches.map(branch => branch.places.get(name)).filter((value): value is Place => !!value);
      place.origins = unionOrigins(place.origins, ...versions.map(value => value.origins));
      place.readonly ||= versions.some(value => value.readonly);
      if (versions.some(value => value.external !== place.external)) place.external = undefined;
    }
  }

  signature(): string {
    return JSON.stringify({ places: [...this.places].map(([name, place]) => [name, [...place.origins].sort(), place.readonly, place.external]),
      tasks: [...this.tasks].map(([task, value]) => [task, value.observed]),
      heap: [...this.heap].map(([origin, fields]) => [origin, [...fields].map(([name, field]) => [name, [...field.origins].sort(), field.mutable])]) });
  }
}

export function sourceName(expression: Expr): string | undefined {
  if (expression.kind === 'call' && expression.callee.kind === 'member') return sourceName(expression.callee.object);
  return expression.kind === 'name' ? expression.name : expression.kind === 'member' ? sourceName(expression.object) : undefined;
}
