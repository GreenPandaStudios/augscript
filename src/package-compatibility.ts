interface Version { numbers: [number, number, number]; prerelease?: string }
const parse = (text: string): Version | undefined => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][A-Za-z0-9-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][A-Za-z0-9-]*))*))?$/.exec(text);
  if (!match) return undefined;
  const numbers = match.slice(1, 4).map(Number) as Version['numbers'];
  return numbers.every(Number.isSafeInteger) ? { numbers, prerelease: match[4] } : undefined;
};
const compare = (left: Version, right: Version): number => {
  for (let index = 0; index < 3; index++) if (left.numbers[index] !== right.numbers[index]) return left.numbers[index] - right.numbers[index];
  return 0;
};

/** Authors opt into a bounded compatibility promise; prereleases require an exact version. */
export function acceptsCompiler(requirement: string, compiler: string): boolean {
  const invalid = (): never => { throw new Error('PACKAGE_COMPILER: Invalid compiler requirement. Use X.Y.Z, ^X.Y.Z, ~X.Y.Z, or >=X.Y.Z <X.Y.Z with a higher upper bound.'); };
  if (typeof requirement !== 'string') return invalid();
  const actual = parse(compiler);
  if (!actual) throw new Error('PACKAGE_COMPILER: Invalid installed compiler version ' + compiler);
  const exact = parse(requirement);
  if (exact) return requirement === compiler;
  const range = /^(\^|~)(.+)$/.exec(requirement);
  let lower: Version | undefined, upper: Version | undefined;
  if (range) {
    lower = parse(range[2]);
    if (!lower || lower.prerelease) return invalid();
    const [major, minor, patch] = lower.numbers;
    upper = { numbers: range[1] === '~' ? [major, minor + 1, 0] : major > 0 ? [major + 1, 0, 0] : minor > 0 ? [0, minor + 1, 0] : [0, 0, patch + 1] };
  } else {
    const bounded = /^>=(\S+) <(\S+)$/.exec(requirement);
    if (bounded) { lower = parse(bounded[1]); upper = parse(bounded[2]); }
  }
  if (!lower || !upper || lower.prerelease || upper.prerelease || !upper.numbers.every(Number.isSafeInteger) || compare(lower, upper) >= 0) return invalid();
  return !actual.prerelease && compare(actual, lower) >= 0 && compare(actual, upper) < 0;
}
