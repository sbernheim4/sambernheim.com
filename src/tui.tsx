import { render } from "ink";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { TuiApp } from "./TuiApp";
import { loadTuiArticles } from "./features/Site/components/tui/articles";

const articles = loadTuiArticles();
export const App = () => {
  return <TuiApp articles={articles} />;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  render(<App />);
}
