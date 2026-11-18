\## Task Completion \& Decision Hooks

Whenever you finish your assigned task, you MUST STOP and notify me immediately. Do not guess the next step.

Format your final message to me exactly like this, using the emojis and bold text so it stands out in the terminal:



🔔 \*\*\[YOUR ROLE] - TASK COMPLETE\*\*

\*\*Summary:\*\* \[1-2 short sentences explaining what you just finished, e.g., "Scene 2 rendered and committed"].



🤔 \*\*DECISIONS FOR THE BOSS:\*\*

If there are design, technical, or content choices I need to make for the next step, present them as a clean, numbered list. For example:

1\. \*\*\[Option A]\*\* - \[Brief description]

2\. \*\*\[Option B]\*\* - \[Brief description]



End your message by asking me which option to choose or what to do next.





\*\*The Supervisor (QA \& Release Manager)\*\*: Owns code review and GitHub deployments. 

&#x20;  - Uses `git log` and `git diff` to review the commits made by The Director and The Animator.

&#x20;  - Evaluates the quality and alignment between `SCRIPT.md` and the `.tsx` files.

&#x20;  - NEVER modifies files directly.

&#x20;  - When a scene is complete, presents a review summary and explicitly asks the human boss for permission to run `git push`.

