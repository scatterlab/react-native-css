import { compileWithAutoDebug } from "react-native-css/jest";

// prettier-ignore
const tests = [
  ["-rn-ripple-color: black;", [{ d: [["black", ["android_ripple", "color"]]], s: [1, 1] }]],
  ["-rn-ripple-style: borderless;", [{ d: [[true, ["android_ripple", "borderless"]]], s: [1, 1] }]],
  ["-rn-ripple-radius: 10;", [{ d: [[10, ["android_ripple", "radius"]]], s: [1, 1] }]],
  ["-rn-ripple-layer: foreground;", [{ d: [[true, ["android_ripple", "foreground"]]], s: [1, 1] }]],
  ["background-position: right 10px top 1rem;", [{ d: [{ backgroundPosition: "right 10px top 14px" }], s: [1, 1] }]],
  ["background-position: 25% 75%, center;", [{ d: [{ backgroundPosition: "25% 75%, center center" }], s: [1, 1] }]],
  ["background-repeat: repeat-y;", [{ d: [{ backgroundRepeat: "repeat-y" }], s: [1, 1] }]],
  ["background-repeat: space round, no-repeat;", [{ d: [{ backgroundRepeat: "space round, no-repeat" }], s: [1, 1] }]],
  ["background-size: 10px 50%;", [{ d: [{ backgroundSize: "10px 50%" }], s: [1, 1] }]],
  ["background-size: cover, 20px auto;", [{ d: [{ backgroundSize: "cover, 20px auto" }], s: [1, 1] }]],
  ["caret-color: black",[{ d: [["#000", ["cursorColor"]]], s: [1, 1] }]],
  ["font-variation-settings: 'wght' 600, \"wdth\" 80.5;", [{ d: [{ fontVariationSettings: "'wght' 600, 'wdth' 80.5" }], s: [1, 1] }]],
  ["font-variation-settings: normal;", [{ d: [{ fontVariationSettings: "normal" }], s: [1, 1] }]],
  ["fill: black;", [{ d: [["#000", ["fill"]]], s: [1, 1] }]],
  ["rotate: 3deg;", [{ d: [[[{}, "rotateZ", "3deg"], "rotateZ"]], s: [1, 1] }]],
  ["rotate: x 3deg;", [{ d: [[[{}, "rotateX", "3deg"], "rotateX"]], s: [1, 1] }]],
  ["stroke-width: 1px;", [{ d: [[1, ["strokeWidth"]]], s: [1, 1] }]],
  ["stroke: black;", [{ d: [["#000", ["stroke"]]], s: [1, 1] }]],
  ["transform-origin: 12.5px -4px;", [{ d: [{ transformOrigin: [12.5, -4, 0] }], s: [1, 1] }]],
  ["transform-origin: left 10px bottom 25%;", [{ d: [{ transformOrigin: [10, "75%", 0] }], s: [1, 1] }]],
] as const;

test.each(tests)("declarations for %s", (declarations, expected) => {
  const compiled = compileWithAutoDebug(`.my-class { ${declarations} }`);

  const stylesheet = compiled.stylesheet();

  const myClassDeclarations = stylesheet.s?.find(
    (rule) => rule[0] === "my-class",
  )?.[1];

  if (!myClassDeclarations) {
    throw new Error("No rule found for .my-class");
  }

  expect(myClassDeclarations).toStrictEqual(expected);
});

test("background lengths that need runtime resolution are dropped", () => {
  const compiled = compileWithAutoDebug(
    `.my-class { background-position: 1em 0; background-size: 2em auto; }`,
  );

  expect(compiled.stylesheet()).toStrictEqual({});
  expect(compiled.warnings()).toStrictEqual({
    values: {
      "background-position": ["1em"],
      "background-size": ["2em"],
    },
  });
});

test("transform-origin offsets from the right or bottom edge are dropped", () => {
  const compiled = compileWithAutoDebug(
    `.my-class { transform-origin: right 10px top; }`,
  );

  expect(compiled.stylesheet()).toStrictEqual({});
  expect(compiled.warnings()).toStrictEqual({
    values: { "transform-origin": ["right offset"] },
  });
});

test.each([
  "background-position: var(--x) 0;",
  "background-repeat: var(--x);",
  "background-size: var(--x);",
  "transform-origin: var(--x);",
])("%s is dropped as it cannot be resolved at runtime", (declaration) => {
  const compiled = compileWithAutoDebug(`.my-class { ${declaration} }`);

  expect(compiled.stylesheet()).toStrictEqual({});
  expect(compiled.warnings()).toStrictEqual({
    properties: [declaration.split(":")[0]],
  });
});

test.each([
  ["mix-blend-mode: plus-darker;", { "mix-blend-mode": ["plus-darker"] }],
  ["isolation: separate;", { isolation: ["separate"] }],
  ["cursor: grab;", { cursor: ["grab"] }],
])(
  "%s warns for values React Native does not support",
  (declaration, values) => {
    const compiled = compileWithAutoDebug(`.my-class { ${declaration} }`);

    expect(compiled.stylesheet()).toStrictEqual({});
    expect(compiled.warnings()).toStrictEqual({ values });
  },
);

test("font-variation-settings with var() is dropped", () => {
  const compiled = compileWithAutoDebug(
    `.my-class { font-variation-settings: var(--axes); }`,
  );

  expect(compiled.stylesheet()).toStrictEqual({});
  expect(compiled.warnings()).toStrictEqual({
    properties: ["font-variation-settings"],
  });
});
