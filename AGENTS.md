<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Render the shared application shell in the root route so leaf pages contain only their own content.
- Import repositories through `@/data` exclusively so the storage implementation can be exchanged in one place.
- Persist exercise and workout data locally through repository interfaces because this stage has no backend.
- Store exercise labels on workout entries when saving and prefer live library labels when displaying; historical workouts remain readable after exercise deletion.
- Keep phone navigation in a dedicated shell component and share safe-area offsets with sticky form actions so navigation and save controls never overlap.
