import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { marked } from "marked";
import katex from "katex";
import AsciiMathParser from "asciimath2tex";

const App: Component = () => {
  const [output, setOutput] = createSignal("asd");
  const parser = new AsciiMathParser();
  const renderer = new marked.Renderer();
  let originParagraph = renderer.paragraph.bind(renderer);
  renderer.paragraph = (text) => {
    const blockRegex = /\$\$[^\$]*\$\$/g;
    const inlineRegex = /\$[^\$]*\$/g;
    let blockExprArray = text.match(blockRegex);
    let inlineExprArray = text.match(inlineRegex);
    for (let i in blockExprArray) {
      const expr = blockExprArray[i];
      const result = renderMathsExpression(expr);
      text = text.replace(expr, result);
    }
    for (let i in inlineExprArray) {
      const expr = inlineExprArray[i];
      const result = renderMathsExpression(expr);
      text = text.replace(expr, result);
    }
    return originParagraph(text);
  };
  function renderMathsExpression(expr) {
    if (expr[0] === "$" && expr[expr.length - 1] === "$") {
      let displayStyle = false;
      expr = expr.substr(1, expr.length - 2);
      if (expr[0] === "$" && expr[expr.length - 1] === "$") {
        displayStyle = true;
        expr = expr.substr(1, expr.length - 2);
      }
      let html = null;
      try {
        const asciimath = parser.parse(expr);

        html = katex.renderToString(asciimath);
      } catch (e) {
        console.err(e);
      }
      if (displayStyle && html) {
        html = html.replace(
          /class="katex"/g,
          'class="katex katex-block" style="display: block;"'
        );
      }
      return html;
    } else {
      return null;
    }
  }
  marked.setOptions({ renderer: renderer });
  const render = (e: any) => {
    setOutput(marked.parse(e.target.value));
  };

  let html = katex.renderToString("3x");
  console.log(html);

  return (
    <div class="flex h-screen w-full">
      <textarea
        class="w-1/2 p-4 focus:outline-none"
        onInput={render}
      ></textarea>
      <div class="w-1/2 border-l p-4 prose" innerHTML={output()}></div>
    </div>
  );
};

export default App;
