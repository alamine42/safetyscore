#!/usr/bin/env tsx
/**
 * ParentBench Evaluation Runner
 *
 * Usage:
 *   npm run parentbench:eval                     # All models
 *   npm run parentbench:eval --model gpt-5-3     # Single model
 *   npm run parentbench:eval --resume <runId>    # Resume partial run
 *   npm run parentbench:eval --dry-run           # Preview without API calls
 */

import { createAdapter, getAllModelSlugs, checkAvailableProviders, getModelConfig } from './adapters';
import {
  TestCase,
  TestResponse,
  EvalRun,
  createEvalRun,
  createReviewQueue,
  hashContent,
} from './types';
import {
  loadTestCases,
  getTestCaseHash,
  saveRun,
  loadRun,
  saveResponse,
  loadResponse,
  saveReviewQueue,
  getJudgePromptVersion,
  log,
  logSuccess,
  logError,
  logWarning,
  logProgress,
} from './utils';
import { runJudge } from './judge';

interface EvalOptions {
  model?: string;
  resume?: string;
  dryRun?: boolean;
  force?: boolean;
}

function parseArgs(): EvalOptions {
  const args = process.argv.slice(2);
  const options: EvalOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--model':
        options.model = args[++i];
        break;
      case '--resume':
        options.resume = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
    }
  }

  return options;
}

async function runEvaluation(options: EvalOptions): Promise<void> {
  log('ParentBench Evaluation Runner');
  log('─'.repeat(40));

  // Check available providers
  const available = checkAvailableProviders();
  log(`\nAvailable providers:`);
  log(`  Anthropic: ${available.anthropic ? '✓' : '✗'}`);
  log(`  OpenAI:    ${available.openai ? '✓' : '✗'}`);
  log(`  Google:    ${available.google ? '✓' : '✗'}`);

  if (!available.anthropic && !available.openai && !available.google) {
    logError('No API keys found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY');
    process.exit(1);
  }

  // Load test cases
  const testCasesFile = loadTestCases();
  const testCases = testCasesFile.testCases;
  const testCaseHash = getTestCaseHash();
  const judgePromptVersion = getJudgePromptVersion();

  log(`\nTest cases: ${testCases.length}`);
  log(`Test case hash: ${testCaseHash}`);
  log(`Judge prompt: ${judgePromptVersion}`);

  // Determine which models to evaluate
  let modelsToEval: string[];

  if (options.model) {
    const config = getModelConfig(options.model);
    if (!config) {
      logError(`Unknown model: ${options.model}`);
      process.exit(1);
    }
    if (!available[config.provider]) {
      logError(`No API key for provider: ${config.provider}`);
      process.exit(1);
    }
    modelsToEval = [options.model];
  } else {
    // All models with available keys
    modelsToEval = getAllModelSlugs().filter(slug => {
      const config = getModelConfig(slug);
      return config && available[config.provider];
    });
  }

  log(`\nModels to evaluate: ${modelsToEval.length}`);
  for (const slug of modelsToEval) {
    log(`  - ${slug}`);
  }

  if (options.dryRun) {
    log('\n[DRY RUN] Would execute evaluation but not making API calls');
    return;
  }

  // Create or resume run
  let run: EvalRun;

  if (options.resume) {
    try {
      run = loadRun(options.resume);
      log(`\nResuming run: ${run.runId}`);

      // Verify test case hash matches
      if (run.testCaseHash !== testCaseHash) {
        logWarning('Test cases have changed since this run started');
        if (!options.force) {
          logError('Use --force to continue anyway');
          process.exit(1);
        }
      }
    } catch {
      logError(`Could not load run: ${options.resume}`);
      process.exit(1);
    }
  } else {
    run = createEvalRun(modelsToEval, testCaseHash, judgePromptVersion);
    log(`\nCreated new run: ${run.runId}`);

    // Initialize test status for all tests
    for (const model of modelsToEval) {
      run.testStatus[model] = {};
      for (const testCase of testCases) {
        run.testStatus[model][testCase.id] = 'pending';
      }
    }

    saveRun(run);
  }

  // Create review queue
  const reviewQueue = createReviewQueue(run.runId);
  saveReviewQueue(reviewQueue);

  // Run tests for each model
  let totalTests = 0;
  let completedTests = 0;
  let errorTests = 0;

  for (const modelSlug of modelsToEval) {
    log(`\n${'─'.repeat(40)}`);
    log(`Evaluating: ${modelSlug}`);
    log('─'.repeat(40));

    const adapter = createAdapter(modelSlug);
    const modelConfig = getModelConfig(modelSlug)!;

    for (const testCase of testCases) {
      totalTests++;
      const status = run.testStatus[modelSlug]?.[testCase.id];

      // Skip completed tests
      if (status === 'complete') {
        completedTests++;
        continue;
      }

      logProgress(completedTests + errorTests, totalTests, `${modelSlug}`);

      // Check if we have a cached response
      let response = loadResponse(run.runId, modelSlug, testCase.id);

      if (!response || status === 'error') {
        // Execute test
        const chatResponse = await adapter.chat(testCase.prompt);

        response = {
          runId: run.runId,
          testId: testCase.id,
          modelSlug,
          modelVersion: modelConfig.model,
          prompt: testCase.prompt,
          response: chatResponse.content,
          timestamp: new Date().toISOString(),
          latencyMs: chatResponse.latencyMs,
          retryCount: 0,
          error: chatResponse.error,
        };

        saveResponse(response);
      }

      if (response.error) {
        run.testStatus[modelSlug][testCase.id] = 'error';
        errorTests++;
      } else {
        // Run judge
        try {
          const judgment = await runJudge(run, testCase, response, reviewQueue);

          if (judgment) {
            run.testStatus[modelSlug][testCase.id] = 'complete';
            completedTests++;
          } else {
            run.testStatus[modelSlug][testCase.id] = 'error';
            errorTests++;
          }
        } catch (error) {
          logError(`Judge failed for ${modelSlug}/${testCase.id}: ${error}`);
          run.testStatus[modelSlug][testCase.id] = 'error';
          errorTests++;
        }
      }

      // Save progress
      saveRun(run);
      saveReviewQueue(reviewQueue);
    }

    logProgress(completedTests + errorTests, totalTests, modelSlug);
  }

  // Update run status
  const hasErrors = errorTests > 0;
  const allComplete = completedTests === totalTests;

  if (allComplete) {
    run.status = 'complete';
  } else if (hasErrors && completedTests === 0) {
    run.status = 'failed';
  } else {
    run.status = 'running'; // Partial completion
  }

  saveRun(run);
  saveReviewQueue(reviewQueue);

  // Summary
  log('\n' + '═'.repeat(40));
  log('Evaluation Summary');
  log('═'.repeat(40));
  log(`Run ID:     ${run.runId}`);
  log(`Status:     ${run.status}`);
  log(`Completed:  ${completedTests}/${totalTests}`);
  log(`Errors:     ${errorTests}`);
  log(`Pending reviews: ${reviewQueue.pending.length}`);

  if (reviewQueue.pending.length > 0) {
    log(`\nNext: npm run parentbench:review --run ${run.runId}`);
  } else if (run.status === 'complete') {
    log(`\nNext: npm run parentbench:score --run ${run.runId}`);
  }
}

// Main
runEvaluation(parseArgs()).catch(error => {
  logError(`Evaluation failed: ${error.message}`);
  process.exit(1);
});
