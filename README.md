# Kiddush Levana

Look up the **molad** (lunar conjunction) and the **earliest and latest times to
say Kiddush Levana** each month, for any US location.

Live: <https://kiddushlevana.vercel.app>

## Why the times are accurate now

Earlier versions calculated the molad with a hand-rolled formula that treated the
molad as Jerusalem *clock* time. The molad is traditionally expressed in
Jerusalem **local mean time** (longitude 35.2354°), which is **20.94 minutes**
ahead of the GMT+2 standard-time meridian — and **39.06 minutes** off in the
other direction when DST is in effect. That introduced the discrepancy noted by
the author of the KosherJava project.

This version computes everything with [`kosher-zmanim`](https://github.com/BehindTheMath/KosherZmanim),
the maintained JS/TS port of the [KosherJava Zmanim API](https://kosherjava.com/zmanim-project/javadoc-api-documentation/).
Its `JewishCalendar` subtracts the 20.94-minute local-mean-time offset and works
in standard time, while DST is applied correctly per location at display time.

Opinions shown:

| Opinion        | Earliest               | Latest                              |
| -------------- | ---------------------- | ----------------------------------- |
| Majority       | 3 days after the molad | halfway between the moldos (Maharil)|
| Shulchan Aruch | 7 days after the molad | 15 days after the molad             |

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [MUI](https://mui.com/) (Material UI)
- [kosher-zmanim](https://github.com/BehindTheMath/KosherZmanim) (zmanim engine, uses [Luxon](https://moment.github.io/luxon/))
- [react-big-calendar](https://github.com/jquense/react-big-calendar) for the month grid
- [zippopotam.us](https://www.zippopotam.us/) for zip → coordinates and `tz-lookup` for coordinates → timezone (browser geolocation uses the same coordinate → timezone path)

## Local development

```bash
npm install
npm run dev       # start the dev server at http://localhost:3000
npm run build     # type-check and build to dist/
npm run preview   # preview the production build
npm run typecheck
npm test          # run the Vitest suite once
npm run test:watch
```

## Tests

[Vitest](https://vitest.dev/) + Testing Library cover the calculation engine and
UI. The suite emphasizes the things most likely to be wrong:

- The KosherJava reference cases (molad accuracy, including the DST case)
- Kiddush Levana boundary math (3/7/15 days, halfway-between-moldos)
- Leap-year handling (Adar I / Adar II) and chronological month ordering
- **Zip codes across every US timezone** (zippopotam.us + `tz-lookup`, with a mocked API) and invalid input
- **International date line / timezone edge cases** — the molad is one instant
  that can render on different civil days (e.g. Friday in Jerusalem, Thursday in
  New York and Honolulu), with DST applied only where observed

## Deployment

Deployed on Vercel. The framework preset, build command, and output directory are
declared in `vercel.json`; pushes to `master` deploy to production automatically.
