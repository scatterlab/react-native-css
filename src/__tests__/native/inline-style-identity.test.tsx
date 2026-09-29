import { render } from "@testing-library/react-native";
import { View } from "react-native-css/components/View";
import { registerCSS, testID } from "react-native-css/jest";
import { VAR_SYMBOL } from "react-native-css/native/reactivity";

/**
 * Libraries such as Reanimated pass style entries that are not plain style
 * objects: an animated style handle is identified by reference and carries
 * non-enumerable members. Inline styles without CSS variables must reach the
 * component untouched.
 */
function createHandle() {
  const handle = {
    viewDescriptors: {
      shareableViewDescriptors: { value: [] },
      add: () => undefined,
      remove: () => undefined,
    },
    initial: { value: { width: 368, height: 90 }, updater: () => undefined },
  };
  Object.defineProperty(handle, "styleUpdaterContainer", {
    enumerable: false,
    value: { current: () => undefined },
  });
  return handle;
}

describe("inline styles without CSS variables", () => {
  test("keep their identity and non-enumerable members without a className", () => {
    const plain = { position: "absolute" as const };
    const handle = createHandle();

    const component = render(
      <View testID={testID} style={[plain, handle as never]} />,
    ).getByTestId(testID);

    const style = component.props.style as unknown[];
    expect(style[0]).toBe(plain);
    expect(style[1]).toBe(handle);
    expect(
      (style[1] as { styleUpdaterContainer?: unknown }).styleUpdaterContainer,
    ).toBeDefined();
  });

  test("keep their identity when merged with a className", () => {
    registerCSS(`.text-red { color: red; }`);
    const handle = createHandle();

    const component = render(
      <View testID={testID} className="text-red" style={[handle as never]} />,
    ).getByTestId(testID);

    const style = (component.props.style as unknown[]).flat(10);
    expect(style).toContain(handle);
  });

  test("still strip CSS variable objects next to untouched entries", () => {
    const handle = createHandle();
    const withVar = {
      opacity: 1,
      color: { [VAR_SYMBOL]: "inline", "--c": "red" },
    };

    const component = render(
      <View testID={testID} style={[handle as never, withVar as never]} />,
    ).getByTestId(testID);

    const style = component.props.style as unknown[];
    expect(style[0]).toBe(handle);
    expect(style[1]).toEqual({ opacity: 1 });
  });
});
