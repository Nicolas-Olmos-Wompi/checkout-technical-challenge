# Workflow Rules

## Git Worktrees

- **Always work on a git worktree**, not the main working directory.
- Use the `using-git-worktrees` skill **before starting any feature work** to create an isolated workspace.
- Worktrees should be created in the `.worktrees/` or `worktrees/` directory (follow the skill's directory selection priority).

## Skills

- **Always use the React Native skill** when working on this codebase.
- If a skill exists for a task, invoke it before proceeding with implementation.

## Architecture

- **Always follow Flux architecture conventions** for state management.
- If unsure about Flux patterns or conventions, search for a skill about Flux architecture before implementing.
- Maintain unidirectional data flow: Actions → Dispatcher → Stores → Views.

## Reference

- Project uses React Native for mobile development.
- State management follows Flux pattern (or Redux/MobX with Flux principles).
