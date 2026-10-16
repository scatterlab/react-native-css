import { render, screen } from "@testing-library/react-native";
import { View } from "react-native-css/components/View";
import { registerCSS, testID } from "react-native-css/jest";

describe("background-image: linear-gradient()", () => {
  test.each([
    ["linear-gradient(red, blue)", "linear-gradient(to bottom, #f00, #00f)"],
    [
      "linear-gradient(45deg, red 10px, 30%, blue 80%)",
      "linear-gradient(45deg, #f00 10px, 30%, #00f 80%)",
    ],
  ])("%s", (input, expected) => {
    registerCSS(`.test { background-image: ${input}; }`);

    render(<View testID={testID} className="test" />);
    const component = screen.getByTestId(testID);

    expect(component.props.style).toStrictEqual({
      experimental_backgroundImage: [expected],
    });
  });
});

describe("background-image: radial-gradient()", () => {
  test.each([
    [
      "radial-gradient(red, blue)",
      "radial-gradient(ellipse farthest-corner at center center, #f00, #00f)",
    ],
    [
      "radial-gradient(circle 100px at 25% 75%, red, blue)",
      "radial-gradient(circle 100px at 25% 75%, #f00, #00f)",
    ],
    [
      "radial-gradient(closest-side at right 10px top, red 10%, blue)",
      "radial-gradient(ellipse closest-side at right 10px top, #f00 10%, #00f)",
    ],
    [
      "radial-gradient(ellipse 20px 50% at left, red, blue)",
      "radial-gradient(ellipse 20px 50% at 0px center, #f00, #00f)",
    ],
  ])("%s", (input, expected) => {
    registerCSS(`.test { background-image: ${input}; }`);

    render(<View testID={testID} className="test" />);
    const component = screen.getByTestId(testID);

    expect(component.props.style).toStrictEqual({
      experimental_backgroundImage: [expected],
    });
  });

  test("lengths that need runtime resolution drop the gradient", () => {
    registerCSS(
      `.test { background-image: radial-gradient(circle 2em, red, blue); }`,
    );

    render(<View testID={testID} className="test" />);
    const component = screen.getByTestId(testID);

    expect(component.props.style).toStrictEqual({
      experimental_backgroundImage: [],
    });
  });
});
