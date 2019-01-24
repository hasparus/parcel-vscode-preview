import React from "react";
import { render } from "react-dom";

import "./styles.scss";

const Hello = () => <main>Hi! Without HTML file.</main>;

render(<Hello />, document.getElementById("root"));
