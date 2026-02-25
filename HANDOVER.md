# SafetyScore — Handover Document

**Last updated:** 2026-02-22 17:50
**Session focus:** Debugging Claude Code freezes during builds

---

## What Got Done This Session

### Diagnosed and Fixed Claude Code Freeze Issue

Claude Code kept freezing/dying during the session. Investigated and resolved the root cause.

**Problem:** Zombie Claude Code processes from previous sessions were consuming system resources, causing memory exhaustion and freezes.

**Solution:** Killed the zombie process (PID 75588) that was:
- Using 136% CPU and 1.4GB RAM
- Stuck in V8 garbage collection loop
- Detached from any terminal (`??`)
- Running for 3+ hours accomplishing nothing

**Result:** Freed ~1.5GB RAM (went from 1GB free to 2.6GB free)

---

## What Worked

- **`kill -9` was required** — Regular `kill` (SIGTERM) returned success but the process ignored it. Had to use `kill -9` (SIGKILL) to actually terminate the zombie.
- **Terminal identification** — Using `ps -o pid,tty,lstart,etime` to identify which processes were attached to active terminals vs detached zombies.
- **The `??` terminal indicator** — Processes showing `??` instead of `ttysXXX` are detached and safe to kill.

## What Didn't Work / Gotchas

- **Previous investigation didn't actually kill the zombie** — The investigation.md from earlier documented the problem and solution, but PID 75588 was never actually killed. It persisted for 3+ more hours.
- **Regular `kill` doesn't work on stuck GC processes** — Claude Code processes stuck in V8 garbage collection loops ignore SIGTERM. Must use `kill -9`.
- **macOS doesn't immediately reclaim memory** — After killing processes, memory isn't freed instantly. Takes a few seconds.

---

## Key Decisions Made

1. **Identified zombie vs active processes by terminal attachment** — Processes with `??` terminal are detached zombies; processes with `ttysXXX` are attached to active terminal sessions.
2. **User confirmed which sessions to preserve** — They had 2 other Claude Code sessions on ttys004 and ttys006. Current session was ttys005. Only killed the detached zombie.

---

## Lessons Learned

### How to Identify Zombie Claude Processes

```bash
# List Claude processes with terminal info
ps -o pid,tty,lstart,etime,command -p $(pgrep claude) 2>/dev/null

# Zombies have:
# - TTY = ?? (detached)
# - High CPU% with long elapsed time
# - No corresponding terminal window
```

### How to Kill Them Safely

```bash
# 1. Identify your current session
tty  # Shows which ttysXXX you're on

# 2. Find detached zombies (TTY = ??)
ps aux | grep claude | grep "??"

# 3. Kill with SIGKILL (regular kill may not work)
kill -9 <PID>

# 4. Verify memory freed
top -l 1 | grep PhysMem
```

### Prevention

- Before running memory-intensive operations (builds), check for zombie processes
- Close old terminal tabs that had Claude Code sessions
- If Claude freezes, the process may survive — check and kill later

---

## Clear Next Steps

### ParentBench Feature (90% Complete)

Only 1 task remaining:
- `safetyscore-dbx.12` — Add ParentBench launch changelog post

The changelog file already exists at `content/posts/introducing-parentbench.json` (untracked).

### Before Running Builds

1. Check for zombie processes: `ps aux | grep claude`
2. Kill any detached ones: `kill -9 <PID>`
3. Verify memory: `top -l 1 | grep PhysMem` (want 2GB+ free)
4. Then run: `npm run build`

### Files to Commit

Currently untracked/modified:
- `content/posts/introducing-parentbench.json` — Changelog post (task .12)
- `investigation.md` — Debug notes (maybe .gitignore this)
- `test-results/` — Test output (maybe .gitignore this)

---

## Map of Important Files

### Investigation/Debug (this session)
```
investigation.md              # Detailed debug log of freeze issues
```

### ParentBench Feature (built in previous sessions)
```
src/types/parentbench.ts                          # ParentBench types
data/parentbench/test-cases.json                  # Eval dataset (50+ cases)
data/parentbench/scores.json                      # Model scores (22 models)
data/parentbench/methodology.json                 # Scoring methodology
src/lib/parentbench.ts                            # Data loaders
src/app/parentbench/page.tsx                      # Leaderboard page
src/app/parentbench/_components/                  # Leaderboard UI components
src/app/model/[slug]/_components/parentbench-badge.tsx  # Model detail badge
content/posts/introducing-parentbench.json        # Changelog post (to commit)
```

### Existing SafetyScore (unchanged)
```
data/models.json                    # 22 models with summary scores
data/scores/*.json                  # Per-model detailed scores
src/types/model.ts                  # Core types
src/lib/data.ts                     # Data loaders
src/app/page.tsx                    # Homepage
src/app/model/[slug]/page.tsx       # Model detail page
```

### Task Management
```
.beads/                             # Beads task database
```

---

## System State at End of Session

```
Memory: 13GB used, 2.6GB free (healthy)
Load: ~4.0 (acceptable)
Active Claude sessions: 3 (ttys004, ttys005, ttys006)
Zombie processes: 0
```

---

## Beads Quick Reference

```bash
bd list                           # List open tasks
bd ready                          # Show unblocked tasks
bd show safetyscore-dbx.12        # Show changelog task details
bd start safetyscore-dbx.12       # Mark as in-progress
bd close safetyscore-dbx.12       # Mark as done
```
