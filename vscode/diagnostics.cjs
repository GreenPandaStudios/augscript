function diagnosticMessage(issue) {
  return issue.message + (issue.code === 'CALL' && issue.expected ? `\nCaller input labels: ${issue.expected}.` : '');
}
function diagnosticForFix(diagnostics, issue) {
  return diagnostics.find(diagnostic => diagnostic.source === 'AugScript' &&
    diagnostic.code === issue.code &&
    (diagnostic.message === issue.message || diagnostic.message === diagnosticMessage(issue)) &&
    diagnostic.range.start.line === issue.line - 1 &&
    diagnostic.range.start.character === issue.column - 1);
}
module.exports = {diagnosticMessage, diagnosticForFix};
