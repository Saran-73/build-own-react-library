// CREATE ELEMENT:  XReact.createElement

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

function createElement(type, props, ...children) {
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

// RENDER:  XReaxt.render that renders the DOM based on js created by XReact.createElement
// const render = (element, container) => {
//   const dom =
//     element.type === "TEXT_ELEMENT"
//       ? document.createTextNode("")
//       : document.createElement(element.type);

//   Object.keys(element.props)
//     .filter((key) => key !== "children")
//     .forEach((each_key) => {
//       dom[each_key] = element.props[each_key];
//     });

// This method uses recursion to render children recursively
// It has a problem as it will block the main thread
//   element.props.children.forEach((child) => {
//     render(child, dom);
//   });

//   container.appendChild(dom);
// };

// create a dom using the fiber node
const createDOM = (fiber) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter((key) => key !== "children")
    .forEach((each_key) => {
      dom[each_key] = fiber.props[each_key];
    });

  return dom;
};

// CONCURRENT MODE :
// Breaking the work into small units of work that browser can interrupt,
// to avoid blocking the main thread when recursively rendering the children.
// So after the completion of each unit of work , let the browser interrupt rendering
// to perform high priority task

let nextUnitOfWork = null;
let wipRoot = null; // work in progress root (root of fibre tree)

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // RENDER phase is completed when all the units of work is processed into creating the fiber tree
  if (!nextUnitOfWork && wipRoot) {
    // initiate COMMIT phase
    commitRoot();
  }

  requestIdleCallback(workLoop); // React doesn’t use requestIdleCallback anymore. Now it uses the scheduler package. But for this use case it’s conceptually the same
}

requestIdleCallback(workLoop);

// FIBER :
// it is a data structure that uses linked list data structure that have a ref to parent, child, sibling fibre
// the goal of fibre DS is to make it easy to find next unit of work
function performUnitOfWork(fiber) {
  // 1. add element to the dom (Problem: but if any high priority task get executed by interrupting the render the user will see incomplete UI)
  // 2. add fiber to all its children
  // 3. set nextunitofwork by returing it

  // 1
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }
  // if (fiber.parent) { // to avoid the Problem
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // 2
  const elements = fiber.props.children;
  let index = 0;
  let previousSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      dom: null,
      props: element.props,
      type: element.type,
      parent: fiber,
    }; //create a new fibre and we add it to the fiber tree setting it either as a child or as a sibling, depending on whether it’s the first child or not.

    if (index == 0) {
      fiber.child = newFiber;
    } else {
      fiber.sibling = newFiber;
    }

    previousSibling = newFiber;
    i++;
  }

  // 3 (search for nexunitofwork first try with the child, then with the sibling, then with the uncle, and so on)
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

// once we finish all the work i.e when there is no nextUnitofWork we commit the whole fiber tree to the DOM
function commitRoot() {
  // add nodes to DOM
}

// In the render function we set nextUnitOfWork to the root of the fiber tree.
const render = (element, container) => {
  // root of fiber tree
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
};

const XReact = {
  createElement,
  render,
};

export default XReact;

// Other Resources:
// https://blog.ag-grid.com/inside-fiber-an-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/
// https://www.youtube.com/watch?v=ZCuYPiUIONs&ab_channel=MetaDevelopers
// https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7
