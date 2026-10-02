import { render, screen } from "@testing-library/react-native";
import { View } from "react-native-css/components";
import { registerCSS } from "react-native-css/jest";

// The component mock does not run the native prop processor, so call it directly.
const processBackgroundImage =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native/Libraries/StyleSheet/processBackgroundImage")
    .default as (value: unknown) => unknown;

test.each([
  ["to right in oklab", "to right"],
  ["to bottom right in oklab", "to bottom right"],
  ["135deg in oklab", "135deg"],
  ["in oklab to right", "to right"],
  ["to right in oklch longer hue", "to right"],
  ["to right in srgb-linear", "to right"],
  ["in oklab", undefined],
])(
  "linear-gradient(%s, …) drops the color interpolation method",
  (position, expected) => {
    registerCSS(
      `.subject { background-image: linear-gradient(${position}, red, blue); }`,
    );
    render(<View testID="subject" className="subject" />);
    const value =
      screen.getByTestId("subject").props.style.experimental_backgroundImage;

    const css = expected
      ? `linear-gradient(${expected}, red, blue)`
      : "linear-gradient(red, blue)";
    expect(value).toBe(css);
    expect(processBackgroundImage(value)).toHaveLength(1);
  },
);

test.each([
  ["in oklab", "radial-gradient(red, blue)"],
  ["circle at center in oklab", "radial-gradient(circle at center, red, blue)"],
])(
  "radial-gradient(%s, …) drops the color interpolation method",
  (position, css) => {
    registerCSS(
      `.subject { background-image: radial-gradient(${position}, red, blue); }`,
    );
    render(<View testID="subject" className="subject" />);
    const value =
      screen.getByTestId("subject").props.style.experimental_backgroundImage;

    expect(value).toBe(css);
    expect(processBackgroundImage(value)).toHaveLength(1);
  },
);
