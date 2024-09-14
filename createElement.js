//----------------------------
// 1. React.CreateElement
//----------------------------
// const element = <h1 title="foo">HEllo</h1>;

// the element is called JSX in React.
// the element is a React element, it is not a valid js.
// the JSX is converted to valid Js by build tools like Babel
// the conversion is done by calling React.CreateElement

// const element = React.CreateElement = (
//     "h1",
//      {
//     title: "foo"
//      },
//     "HELLO"
//   )

// which is converted to valid js like

// const element = {
//   type: "h1", //
//   props: {
//     title: "foo",
//     children: "HELLO",  // children in this case is a string, but it’s usually an array with more elements. That’s why elements are also trees.
//   },
// };

export default function createElement(type, props, ...children) {
  return {
    type: type,
    props: {
      ...props,
      children: children.map((child) => {
        if (typeof child === "object") {
          return child;
        } else {
          return createTextElement(child); // children that are of primitive types
        }
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [], // react dont set empty array but to avoid complexity here we use it
    },
  };
}

// createElement eg:
// const element = createElement(
//   "ul",
//   {
//     id: "fruits-list",
//   },
//   createElement("li", null, "Apple"),
//   createElement("li", null, "Orange"),
//   createElement("li", null, "Carrot")
// );

// /** @jsxRuntime classic */ // if babel is latest switch to older method
// /** @jsx XReact.createElement */ with this comment Babel will take jsx and convert to valid js using own XReact
// const element = (
//     <ul id="foo">
//       <li>Apple</li>
//       <li>Orange</li>
//       <li>Carrot</li>
//     </ul>
//   )
