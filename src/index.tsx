import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root")!;
const root = createRoot(container);

import { Provider } from "react-redux";
import { store } from "./app/store";

root.render(
    <Provider store={store}>
        <App />
    </Provider>,
);
