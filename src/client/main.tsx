import { render } from "preact";
import { App } from "./app";
import "@excalidraw/excalidraw/index.css";
import "./styles.css";

render(<App />, document.getElementById("app")!);
