import { TestResult } from './TestRunner'
import { BugReport } from './BugDetector'
import { Screenshot } from './CanvasCapture'

export interface TestReport {
  id: string
  generatedAt: number
  summary: {
    totalTests: number
    passed: number
    failed: number
    duration: number
    bugs: {
      total: number
      critical: number
      high: number
      medium: number
      low: number
    }
  }
  results: TestResult[]
  bugs: BugReport[]
  screenshots: Screenshot[]
}

export class ReportGenerator {
  generateReport(results: TestResult[], bugs: BugReport[]): TestReport {
    const screenshots: Screenshot[] = []

    // Collect all screenshots
    for (const result of results) {
      screenshots.push(...result.screenshots)
    }

    const summary = {
      totalTests: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      bugs: {
        total: bugs.length,
        critical: bugs.filter(b => b.severity === 'critical').length,
        high: bugs.filter(b => b.severity === 'high').length,
        medium: bugs.filter(b => b.severity === 'medium').length,
        low: bugs.filter(b => b.severity === 'low').length
      }
    }

    return {
      id: `report-${Date.now()}`,
      generatedAt: Date.now(),
      summary,
      results,
      bugs,
      screenshots
    }
  }

  generateHTML(report: TestReport): string {
    const passRate = ((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)
    const avgDuration = (report.summary.duration / report.summary.totalTests).toFixed(0)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MapMaker Visual Test Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #1a1a1a;
      color: #e5e5e5;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: linear-gradient(135deg, #922610 0%, #C9AD6A 100%);
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: white;
    }

    .timestamp {
      opacity: 0.9;
      color: white;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #3a3a3a;
    }

    .summary-card h3 {
      font-size: 0.875rem;
      color: #C9AD6A;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }

    .summary-card .value {
      font-size: 2rem;
      font-weight: bold;
    }

    .summary-card .unit {
      font-size: 0.875rem;
      color: #999;
      margin-left: 5px;
    }

    .passed { color: #4ade80; }
    .failed { color: #f87171; }
    .warning { color: #fbbf24; }
    .critical { color: #dc2626; }
    .high { color: #f97316; }
    .medium { color: #fbbf24; }
    .low { color: #60a5fa; }

    .section {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 20px;
      border: 1px solid #3a3a3a;
    }

    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #C9AD6A;
      border-bottom: 2px solid #3a3a3a;
      padding-bottom: 10px;
    }

    .test-result {
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .test-name {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .test-status {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: bold;
    }

    .status-passed {
      background: #065f46;
      color: #4ade80;
    }

    .status-failed {
      background: #7f1d1d;
      color: #f87171;
    }

    .test-steps {
      margin-top: 10px;
      padding-left: 20px;
    }

    .step {
      margin: 5px 0;
      font-size: 0.9rem;
    }

    .step.failed {
      color: #f87171;
    }

    .step.success {
      color: #4ade80;
    }

    .bug-report {
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .bug-header {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }

    .bug-severity {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .severity-critical {
      background: #dc2626;
      color: white;
    }

    .severity-high {
      background: #f97316;
      color: white;
    }

    .severity-medium {
      background: #fbbf24;
      color: #1a1a1a;
    }

    .severity-low {
      background: #60a5fa;
      color: white;
    }

    .bug-type {
      color: #999;
      font-size: 0.875rem;
    }

    .bug-description {
      margin: 10px 0;
      color: #e5e5e5;
    }

    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .screenshot-card {
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      overflow: hidden;
    }

    .screenshot-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .screenshot-image:hover {
      transform: scale(1.05);
    }

    .screenshot-caption {
      padding: 10px;
      font-size: 0.875rem;
      color: #999;
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .modal.open {
      display: flex;
    }

    .modal-image {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }

    .modal-close {
      position: absolute;
      top: 20px;
      right: 40px;
      color: white;
      font-size: 30px;
      cursor: pointer;
      background: none;
      border: none;
    }

    .chart {
      height: 200px;
      margin-top: 20px;
      position: relative;
    }

    footer {
      text-align: center;
      color: #666;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #3a3a3a;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🧪 MapMaker Visual Test Report</h1>
      <div class="timestamp">Generated: ${new Date(report.generatedAt).toLocaleString()}</div>
    </header>

    <div class="summary">
      <div class="summary-card">
        <h3>Tests Run</h3>
        <div class="value">${report.summary.totalTests}</div>
      </div>

      <div class="summary-card">
        <h3>Pass Rate</h3>
        <div class="value ${parseFloat(passRate) >= 80 ? 'passed' : 'failed'}">${passRate}<span class="unit">%</span></div>
      </div>

      <div class="summary-card">
        <h3>Passed</h3>
        <div class="value passed">${report.summary.passed}</div>
      </div>

      <div class="summary-card">
        <h3>Failed</h3>
        <div class="value failed">${report.summary.failed}</div>
      </div>

      <div class="summary-card">
        <h3>Total Duration</h3>
        <div class="value">${(report.summary.duration / 1000).toFixed(1)}<span class="unit">s</span></div>
      </div>

      <div class="summary-card">
        <h3>Avg Duration</h3>
        <div class="value">${avgDuration}<span class="unit">ms</span></div>
      </div>

      <div class="summary-card">
        <h3>Bugs Found</h3>
        <div class="value ${report.summary.bugs.total > 0 ? 'warning' : 'passed'}">${report.summary.bugs.total}</div>
      </div>

      <div class="summary-card">
        <h3>Critical Bugs</h3>
        <div class="value critical">${report.summary.bugs.critical}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 Test Results</h2>
      ${report.results.map(result => `
        <div class="test-result">
          <div class="test-header">
            <div class="test-name">${result.scenarioName}</div>
            <div class="test-status ${result.success ? 'status-passed' : 'status-failed'}">
              ${result.success ? '✓ PASSED' : '✗ FAILED'}
            </div>
          </div>
          <div style="color: #999; font-size: 0.875rem; margin-bottom: 10px;">
            Duration: ${result.duration}ms | Steps: ${result.steps.length} | Screenshots: ${result.screenshots.length}
          </div>
          ${result.errors.length > 0 ? `
            <div style="background: #7f1d1d; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
              ${result.errors.map(e => `<div style="color: #f87171;">• ${e}</div>`).join('')}
            </div>
          ` : ''}
          <div class="test-steps">
            ${result.steps.map(step => `
              <div class="step ${step.success ? 'success' : 'failed'}">
                ${step.success ? '✓' : '✗'} Step ${step.stepIndex + 1}: ${step.description} (${step.duration}ms)
                ${step.error ? `<div style="color: #f87171; margin-left: 20px;">Error: ${step.error}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    ${report.bugs.length > 0 ? `
      <div class="section">
        <h2>🐛 Bug Reports</h2>
        ${report.bugs.map(bug => `
          <div class="bug-report">
            <div class="bug-header">
              <span class="bug-severity severity-${bug.severity}">${bug.severity}</span>
              <span class="bug-type">${bug.type.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="bug-description">${bug.description}</div>
            ${bug.location ? `
              <div style="color: #999; font-size: 0.875rem;">
                Location: (${bug.location.x}, ${bug.location.y})
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${report.screenshots.length > 0 ? `
      <div class="section">
        <h2>📸 Screenshots</h2>
        <div class="screenshots">
          ${report.screenshots.map((screenshot, index) => `
            <div class="screenshot-card">
              <img
                class="screenshot-image"
                src="${screenshot.dataUrl}"
                alt="Screenshot ${index + 1}"
                onclick="openModal('${screenshot.dataUrl}')"
              />
              <div class="screenshot-caption">
                ${screenshot.metadata?.description || `Screenshot ${index + 1}`}
                ${screenshot.metadata?.testName ? `<br>Test: ${screenshot.metadata.testName}` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <footer>
      <p>MapMaker Visual Testing System v1.0.0</p>
      <p>Report generated on ${new Date().toLocaleDateString()}</p>
    </footer>
  </div>

  <div id="modal" class="modal" onclick="closeModal()">
    <button class="modal-close" onclick="closeModal()">×</button>
    <img id="modal-image" class="modal-image" src="" alt="Full size screenshot" />
  </div>

  <script>
    function openModal(src) {
      document.getElementById('modal').classList.add('open');
      document.getElementById('modal-image').src = src;
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('open');
    }

    // Prevent image click from closing modal
    document.getElementById('modal-image').onclick = function(e) {
      e.stopPropagation();
    }
  </script>
</body>
</html>
    `
  }

  saveReport(report: TestReport, filename?: string): void {
    const html = this.generateHTML(report)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `test-report-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  generateMarkdown(report: TestReport): string {
    const passRate = ((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)

    return `# MapMaker Visual Test Report

Generated: ${new Date(report.generatedAt).toLocaleString()}

## Summary

- **Total Tests**: ${report.summary.totalTests}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}
- **Pass Rate**: ${passRate}%
- **Total Duration**: ${(report.summary.duration / 1000).toFixed(1)}s
- **Bugs Found**: ${report.summary.bugs.total}
  - Critical: ${report.summary.bugs.critical}
  - High: ${report.summary.bugs.high}
  - Medium: ${report.summary.bugs.medium}
  - Low: ${report.summary.bugs.low}

## Test Results

${report.results.map(result => `
### ${result.scenarioName}
- **Status**: ${result.success ? '✅ PASSED' : '❌ FAILED'}
- **Duration**: ${result.duration}ms
- **Steps**: ${result.steps.length}
- **Screenshots**: ${result.screenshots.length}

${result.errors.length > 0 ? `
#### Errors:
${result.errors.map(e => `- ${e}`).join('\n')}
` : ''}

#### Steps:
${result.steps.map(step => `
${step.stepIndex + 1}. ${step.success ? '✓' : '✗'} ${step.description} (${step.duration}ms)${step.error ? `
   - Error: ${step.error}` : ''}`).join('\n')}
`).join('\n')}

## Bug Reports

${report.bugs.length > 0 ? report.bugs.map(bug => `
### ${bug.type.replace('-', ' ').toUpperCase()} [${bug.severity.toUpperCase()}]
- **Description**: ${bug.description}
${bug.location ? `- **Location**: (${bug.location.x}, ${bug.location.y})` : ''}
`).join('\n') : 'No bugs detected.'}

## Screenshots

Total screenshots captured: ${report.screenshots.length}

---
*MapMaker Visual Testing System v1.0.0*
`
  }
}