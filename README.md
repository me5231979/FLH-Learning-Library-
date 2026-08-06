# The Vanderbilt Staff Learning Collection

The catalog for the **Learning on Demand** program: live, interactive
classroom courses (websites, not slide decks) with matching facilitator
editions, ready to deliver in person or virtually.

**Live:** https://me5231979.github.io/Course_Library/

## The courses

| Course | Audience | Learner | Facilitator |
|---|---|---|---|
| Start Smarter | All staff | [launch](https://me5231979.github.io/AI_Classroom/) | [guide](https://me5231979.github.io/AI_Classroom/facilitator/) |
| Navigating Difficult Conversations | People managers | [launch](https://me5231979.github.io/Difficult_Conversations/) | [guide](https://me5231979.github.io/Difficult_Conversations/facilitator/) |

## Adding a course

1. Build the course in its own repo (use AI_Classroom or
   Difficult_Conversations as the template: one index.html, one CSS, one JS,
   `tools/build-facilitator.py`, `facilitator/notes.json`).
2. Publish it to GitHub Pages (`gh-pages` branch mirrors `main`).
3. Add a `<article class="course">` card to this repo's `index.html`
   (copy an existing card; update the tag, title, description, meta,
   and the four links) and a row to the footer lists.
4. Publish: `git push origin main && git branch -f gh-pages main && git push -f origin gh-pages`

## Design

Vanderbilt FLH system, matching the courses: black #1C1C1C / white / flat
gold #CFAE70, Libre Caslon Display headlines (one italic word), Inter body,
Antonio eyebrows, motion ≤400ms. No frameworks: one HTML file, one CSS
file, a few lines of inline JS, self-hosted fonts.
