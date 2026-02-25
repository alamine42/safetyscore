#!/usr/bin/env tsx
import { config } from 'dotenv';
config({ path: '.env.local' });

/**
 * ParentBench Run Management
 *
 * List and manage evaluation runs.
 *
 * Usage:
 *   npm run parentbench:runs                    # List all runs
 *   npm run parentbench:runs --status           # Show run statuses
 *   npm run parentbench:validate --run <runId>  # Validate run integrity
 */

import * as fs from 'fs';
import * as path from 'path';
import { EvalRun } from './types';
import {
  listRuns,
  loadRun,
  loadReviewQueue,
  getRunDir,
  log,
  logSuccess,
  logError,
  logWarning,
} from './utils';

interface RunsOptions {
  status?: boolean;
  validate?: string;
}

function parseArgs(): RunsOptions {
  const args = process.argv.slice(2);
  const options: RunsOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--status':
        options.status = true;
        break;
      case '--run':
      case '--validate':
        options.validate = args[++i];
        break;
    }
  }

  return options;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function listAllRuns(showStatus: boolean): void {
  const runIds = listRuns();

  if (runIds.length === 0) {
    log('No evaluation runs found.');
    log('Run: npm run parentbench:eval');
    return;
  }

  log('ParentBench Runs');
  log('═'.repeat(60));

  const runs: EvalRun[] = [];
  for (const runId of runIds) {
    try {
      runs.push(loadRun(runId));
    } catch {
      logWarning(`Could not load run: ${runId}`);
    }
  }

  // Sort by creation date descending
  runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  for (const run of runs) {
    log(`\n${run.runId}`);
    log(`  Created: ${formatDate(run.createdAt)}`);
    log(`  Status:  ${run.status}`);
    log(`  Models:  ${run.models.length}`);

    if (showStatus) {
      // Count test statuses
      let complete = 0;
      let pending = 0;
      let error = 0;

      for (const tests of Object.values(run.testStatus)) {
        for (const status of Object.values(tests)) {
          if (status === 'complete') complete++;
          else if (status === 'pending') pending++;
          else if (status === 'error') error++;
        }
      }

      log(`  Tests:   ${complete} complete, ${pending} pending, ${error} errors`);

      const queue = loadReviewQueue(run.runId);
      if (queue) {
        log(`  Reviews: ${queue.completed.length} done, ${queue.pending.length} pending`);
      }
    }
  }

  log(`\nTotal: ${runs.length} run(s)`);
}

function validateRun(runId: string): void {
  log(`Validating run: ${runId}`);
  log('─'.repeat(40));

  let errors = 0;
  let warnings = 0;

  // Check manifest exists
  const runDir = getRunDir(runId);
  const manifestPath = path.join(runDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    logError('Manifest not found');
    errors++;
    return;
  }

  const run = loadRun(runId);
  log(`Status: ${run.status}`);
  log(`Models: ${run.models.join(', ')}`);

  // Validate responses directory
  const responsesDir = path.join(runDir, 'responses');
  if (!fs.existsSync(responsesDir)) {
    logWarning('Responses directory not found');
    warnings++;
  } else {
    for (const model of run.models) {
      const modelDir = path.join(responsesDir, model);
      if (!fs.existsSync(modelDir)) {
        logWarning(`Missing responses for ${model}`);
        warnings++;
      } else {
        const responseFiles = fs.readdirSync(modelDir).filter(f => f.endsWith('.json'));
        const expectedTests = Object.keys(run.testStatus[model] ?? {}).length;

        if (responseFiles.length < expectedTests) {
          logWarning(`${model}: ${responseFiles.length}/${expectedTests} responses`);
          warnings++;
        }
      }
    }
  }

  // Validate judgments directory
  const judgmentsDir = path.join(runDir, 'judgments');
  if (!fs.existsSync(judgmentsDir)) {
    logWarning('Judgments directory not found');
    warnings++;
  } else {
    for (const model of run.models) {
      const modelDir = path.join(judgmentsDir, model);
      if (!fs.existsSync(modelDir)) {
        logWarning(`Missing judgments for ${model}`);
        warnings++;
      }
    }
  }

  // Validate review queue
  const queuePath = path.join(runDir, 'review-queue.json');
  if (!fs.existsSync(queuePath)) {
    logWarning('Review queue not found');
    warnings++;
  } else {
    const queue = loadReviewQueue(runId);
    if (queue) {
      log(`Review queue: ${queue.pending.length} pending, ${queue.completed.length} completed`);
    }
  }

  // Summary
  log('\n' + '─'.repeat(40));
  if (errors === 0 && warnings === 0) {
    logSuccess('Validation passed');
  } else {
    log(`Errors: ${errors}, Warnings: ${warnings}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.validate) {
    validateRun(options.validate);
  } else {
    listAllRuns(options.status ?? false);
  }
}

main().catch(error => {
  logError(`Failed: ${error.message}`);
  process.exit(1);
});
